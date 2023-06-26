import { action, makeObservable, observable, when } from 'mobx';
import moment from 'moment';
import { TFlutterChart, TLoadHistoryParams, TQuote } from 'src/types';
import { createChartElement } from 'src/flutter-chart';
import MainStore from './';

export default class ChartAdapterStore {
    private mainStore: MainStore;
    isChartLoaded = false;
    isDataInitialized = false;
    flutterChart?: TFlutterChart;
    epochBounds = {
        leftEpoch: 0,
        rightEpoch: 0,
    };
    quoteBounds = {
        topQuote: 0,
        bottomQuote: 0,
    };
    msPerPx?: number;

    constructor(mainStore: MainStore) {
        makeObservable(this, {
            onMount: action.bound,
            onTickHistory: action.bound,
            onChartLoad: action.bound,
            onTick: action.bound,
            loadHistory: action.bound,
            onVisibleAreaChanged: action.bound,
            onQuoteAreaChanged: action.bound,
            setMsPerPx: action.bound,
            isChartLoaded: observable,
            isDataInitialized: observable,
            epochBounds: observable.ref,
            quoteBounds: observable.ref,
            msPerPx: observable,
        });

        this.mainStore = mainStore;

        this.initFlutterCharts();
    }

    initFlutterCharts() {
        window.jsInterop = {
            onChartLoad: this.onChartLoad,
            onVisibleAreaChanged: this.onVisibleAreaChanged,
            onQuoteAreaChanged: this.onQuoteAreaChanged,
            loadHistory: this.loadHistory,
            onCrosshairDisappeared: () => {
                this.mainStore.crosshair.updateVisibility(false);
            },
            onCrosshairHover: (dx, dy, epoch, quote) => {
                this.mainStore.crosshair.onMouseMove(dx, dy, epoch, quote);
            },
            indicators: {
                onRemove: (index: number) => {
                    this.mainStore.studies.deleteStudy(index);
                },
                onEdit: (index: number) => {
                    this.mainStore.studies.editStudyByIndex(index);
                },
                onSwap: (index1: number, index2: number) => {
                    const { activeItems } = this.mainStore.studies;
                    [activeItems[index1], activeItems[index2]] = [activeItems[index2], activeItems[index1]];
                },
            },
        };

        if (!window.flutterChartElement) {
            const flutterChartElement = createChartElement();

            flutterChartElement.addEventListener(
                'wheel',
                e => {
                    e.preventDefault();

                    if (e.deltaX == 0 && e.deltaZ == 0) {
                        const scale = (100 - e.deltaY) / 100;
                        this.scale(scale);
                    } else {
                        this.flutterChart?.controller.scroll(e.deltaX);
                    }

                    return false;
                },
                { capture: true, passive: false }
            );

            // @ts-ignore
            import(/* webpackChunkName: "flutter-chart-adapter" */ 'chart/main.dart.js');
        } else {
            this.onChartLoad();
        }
    }

    async onMount(element: HTMLDivElement) {
        element.appendChild(window.flutterChartElement);
    }

    onChartLoad() {
        this.flutterChart = window.flutterChart;
        this.isChartLoaded = true;
    }

    onVisibleAreaChanged(leftEpoch: number, rightEpoch: number) {
        if (this.epochBounds.leftEpoch != leftEpoch || this.epochBounds.rightEpoch != rightEpoch) {
            this.epochBounds = {
                leftEpoch,
                rightEpoch,
            };
        }
    }

    onQuoteAreaChanged(topQuote: number, bottomQuote: number) {
        this.quoteBounds = {
            topQuote,
            bottomQuote,
        };
    }

    getGranularityInMs() {
        let granularity: number =
            this.mainStore.state.granularity || this.mainStore.chart.feed?.getQuotesInterval() || 1;

        return granularity * 1000;
    }

    newChart = async () => {
        await when(() => this.isChartLoaded);

        this.flutterChart?.config.newChart({
            granularity: this.getGranularityInMs(),
            chartType: this.mainStore.state.chartType,
            isLive: this.mainStore.chart.isLive || false,
            dataFitEnabled: this.mainStore.chart.dataFitEnabled || false,
            theme: this.mainStore.chartSetting.theme,
            msPerPx: this.msPerPx,
            pipSize: this.mainStore.chart.pip,
        });
    };

    async onTickHistory(quotes: TQuote[]) {
        await when(() => this.isChartLoaded);
        this.isDataInitialized = true;

        this.mainStore.chart.feed?.updateQuotes(quotes, false);
        this.flutterChart?.dataModel.onTickHistory(quotes, false);
    }

    async onTick(quote: TQuote) {
        await when(() => this.isChartLoaded);

        const lastQuote = this.mainStore.chart.feed?.quotes[this.mainStore.chart.feed?.quotes.length - 1];
        if (lastQuote && new Date(lastQuote.Date) > new Date(quote.Date)) return;

        this.mainStore.chart.feed?.addQuote(quote);

        if (quote.ohlc) {
            this.flutterChart?.dataModel.onNewCandle(quote);
        } else if (this.getGranularityInMs() < 60000) {
            this.flutterChart?.dataModel.onNewTick(quote);
        }
    }

    loadHistory(payload: TLoadHistoryParams) {
        const { count, end } = payload;
        const { state, chart } = this.mainStore;
        const { granularity } = state;

        chart.feed?.fetchPaginationData(
            chart.currentActiveSymbol?.symbol as string,
            end,
            count,
            granularity,
            ({ quotes }) => {
                if (!quotes) return;

                this.mainStore.chart.feed?.updateQuotes(quotes, true);
                this.flutterChart?.dataModel.onTickHistory(quotes, true);
            }
        );
    }

    updateChartStyle(chartType: string) {
        this.flutterChart?.config.updateChartStyle(chartType);
    }

    updateTheme(theme: string) {
        this.flutterChart?.config.updateTheme(theme);
    }

    async updateLeftMargin(leftMargin?: number) {
        await when(() => this.isChartLoaded);
        this.flutterChart?.config.updateLeftMargin(leftMargin);
    }

    scale(scale: number) {
        this.msPerPx = this.flutterChart?.controller.scale(scale);
        this.mainStore.state.saveLayout();
    }

    async updateMarkers(contractsMarker: any[]) {
        const transformedContractsMarker = contractsMarker
            .filter(c => c.markers?.length > 0)
            .map(c => {
                c.markers.forEach((m: any) => {
                    if (!m.quote) {
                        const { price } = this.getInterpolatedPositionAndPrice(m.epoch) || {};
                        m.quote = price;
                    }
                });
                return c;
            });

        await when(() => this.isDataInitialized);

        this.flutterChart?.config.updateMarkers(transformedContractsMarker);
    }

    getInterpolatedPositionAndPrice = (epoch: number) => {
        if (!epoch) return;

        const date = moment.utc(epoch).toDate();

        let tickIdx = this.mainStore.chart.feed?.getClosestQuoteIndexForEpoch(epoch);

        // To not place markers in the middle of ticks.
        let x: number = this.getXFromEpoch(epoch);

        if (typeof tickIdx === 'number' && tickIdx > -1) {
            const bar = this.mainStore.chart.feed?.quotes[tickIdx];

            let price = bar ? bar.Close : null;
            let delta_x, delta_y, ratio;

            // Here we interpolate the pixel distance between two adjacent ticks.
            if (bar && bar.DT! < date) {
                const barNext = this.mainStore.chart.feed?.quotes[tickIdx + 1];
                const barPrev = tickIdx > 0 ? this.mainStore.chart.feed?.quotes[tickIdx - 1] : null;

                if (barNext && barNext.Close && barNext.DT! > date) {
                    delta_x = this.getXFromEpoch(barNext.DT!.getTime()) - x;

                    ratio =
                        (((date as unknown) as number) - bar.DT!.getTime()) /
                        (barNext.DT!.getTime() - bar.DT!.getTime());

                    if (price) delta_y = barNext.Close - price;
                } else if (barPrev && barPrev.Close) {
                    delta_x = x - this.getXFromEpoch(barPrev.DT!.getTime());

                    ratio =
                        (((date as unknown) as number) - bar.DT!.getTime()) /
                        (bar.DT!.getTime() - barPrev.DT!.getTime());

                    if (price) delta_y = price - barPrev.Close;
                }
            }

            if (ratio) {
                if (delta_x) {
                    x += ratio * delta_x;
                }

                if (price && delta_y) {
                    price += ratio * delta_y;
                }
            }

            return {
                x,
                price,
            };
        }
    };

    setMsPerPx(msPerPx?: number) {
        this.msPerPx = msPerPx;
    }

    getXFromEpoch(epoch: number) {
        return this.flutterChart!.controller.getXFromEpoch(epoch);
    }

    getYFromQuote(quote: number) {
        return this.flutterChart!.controller.getYFromQuote(quote);
    }

    getEpochFromX(x: number) {
        return this.flutterChart!.controller.getEpochFromX(x);
    }

    getQuoteFromY(y: number) {
        return this.flutterChart!.controller.getQuoteFromY(y);
    }
}