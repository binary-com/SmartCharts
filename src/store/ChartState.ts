/* eslint-disable no-new */
import { action, observable, when, makeObservable, reaction } from 'mobx';
import {
    TChartControlsWidgets,
    TChartProps,
    TGetIndicatorHeightRatio,
    TGranularity,
    TLayout,
    TSettings,
} from 'src/types';
import debounce from 'lodash.debounce';
import { AuditDetailsForExpiredContract, ProposalOpenContract } from '@deriv/api-types';
import { isDeepEqual } from 'src/utils/object';
import MainStore from '.';
import Theme from '../../sass/_themes.scss';
import { STATE } from '../Constant';
import {
    calculateTimeUnitInterval,
    createObjectFromLocalStorage,
    saveToLocalStorage,
    getYAxisScalingParams,
} from '../utils';
import ChartStore from './ChartStore';

type TStateChangeOption = {
    indicator_type_name?: string;
    indicators_category_name?: string;
    isClosed?: boolean;
    is_favorite?: boolean;
    is_info_open?: boolean;
    is_open?: boolean;
    chart_type_name?: string;
    search_string?: string;
    symbol?: string;
    symbol_category?: string;
    time_interval_name?: string;
};

class ChartState {
    chartStore: ChartStore;
    getIndicatorHeightRatio?: TGetIndicatorHeightRatio;
    shouldDrawTicksFromContractInfo? = false;
    has_updated_settings = false;
    isAnimationEnabled?: boolean;
    mainStore: MainStore;
    margin?: number;
    granularity: TGranularity;
    chartType?: string;
    startEpoch?: number;
    endEpoch?: number;
    symbol?: string;
    heightFactor?: number;
    isConnectionOpened? = false;
    isChartReady = false;
    chartStatusListener?: (isChartReady: boolean) => boolean;
    stateChangeListener?: (state: string, option?: TStateChangeOption) => void;
    settings?: TSettings;
    showLastDigitStats = false;
    scrollToEpoch?: number | null;
    clearChart?: () => void;
    isChartClosed = false;
    shouldMinimiseLastDigits = false;
    should_show_eu_content?: boolean;
    allowTickChartTypeOnly?: boolean;
    isStaticChart? = false;
    shouldFetchTradingTimes = true;
    shouldFetchTickHistory = true;
    allTicks: NonNullable<AuditDetailsForExpiredContract>['all_ticks'] = [];
    contractInfo: ProposalOpenContract = {};
    refreshActiveSymbols?: boolean;
    hasReachedEndOfData = false;
    prevChartType?: string;
    isChartScrollingToEpoch = false;
    crosshairState?: number = 1;
    crosshairTooltipLeftAllow: number | null = null;
    maxTick?: number;
    enableScroll: boolean | null = true;
    enableZoom: boolean | null = true;
    yAxisMargin = { top: 106, bottom: 64 };
    tradingTimes: string | null = null;
    activeSymbols: string | null = null;
    chartControlsWidgets?: TChartControlsWidgets;
    enabledChartFooter?: boolean;

    get context() {
        return this.chartStore.context;
    }
    get chartTypeStore() {
        return this.mainStore.chartType;
    }
    get timeperiodStore() {
        return this.mainStore.timeperiod;
    }
    get loader() {
        return this.mainStore.loader;
    }
    get rootElement() {
        return this.chartStore.rootElement;
    }

    constructor(mainStore: MainStore) {
        makeObservable(this, {
            granularity: observable,
            chartType: observable,
            startEpoch: observable,
            endEpoch: observable,
            symbol: observable,
            has_updated_settings: observable,
            heightFactor: observable,
            isConnectionOpened: observable,
            isChartReady: observable,
            chartStatusListener: observable,
            debouncedStateChange: action.bound,
            stateChangeListener: observable,
            should_show_eu_content: observable,
            settings: observable,
            showLastDigitStats: observable,
            allowTickChartTypeOnly: observable,
            scrollToEpoch: observable,
            clearChart: observable,
            isChartClosed: observable,
            shouldMinimiseLastDigits: observable,
            isStaticChart: observable,
            shouldFetchTradingTimes: observable,
            shouldFetchTickHistory: observable,
            allTicks: observable,
            contractInfo: observable,
            refreshActiveSymbols: observable,
            shouldDrawTicksFromContractInfo: observable,
            hasReachedEndOfData: observable,
            prevChartType: observable,
            isChartScrollingToEpoch: observable,
            crosshairState: observable,
            crosshairTooltipLeftAllow: observable,
            maxTick: observable,
            enableScroll: observable,
            enableZoom: observable,
            yAxisMargin: observable,
            updateProps: action.bound,
            setChartIsReady: action.bound,
            setChartClosed: action.bound,
        });

        this.mainStore = mainStore;
        this.chartStore = mainStore.chart;
        when(() => !!this.context, this.onContextReady);
        reaction(
            () => this.allowTickChartTypeOnly,
            allowTickChartTypeOnly => {
                if (allowTickChartTypeOnly) {
                    this.mainStore.studies.savePredictionStudies();
                    this.mainStore.studies.deletePredictionStudies();
                }
            }
        );
    }

    onContextReady = () => {
        this.granularity = this.chartStore.granularity;
    };

    updateProps({
        networkStatus,
        chartControlsWidgets,
        enabledChartFooter,
        chartStatusListener,
        shouldDrawTicksFromContractInfo,
        stateChangeListener,
        getIndicatorHeightRatio,
        chartType,
        clearChart,
        endEpoch,
        isAnimationEnabled = true,
        isConnectionOpened,
        isStaticChart,
        granularity,
        margin = 0,
        refreshActiveSymbols,
        scrollToEpoch,
        settings,
        shouldFetchTradingTimes = true,
        shouldFetchTickHistory = true,
        should_show_eu_content,
        should_zoom_out_on_yaxis,
        allTicks = [],
        contractInfo = {},
        showLastDigitStats = false,
        allowTickChartTypeOnly = false,
        startEpoch,
        symbol,
        crosshairState,
        zoom,
        maxTick,
        crosshairTooltipLeftAllow,
        yAxisMargin,
        enableScroll = null,
        enableZoom = null,
        anchorChartToLeft = false,
        chartData,
        isLive,
        startWithDataFitMode,
        leftMargin,
    }: TChartProps) {
        let isSymbolChanged = false;
        let isGranularityChanged = false;

        if (
            chartData?.tradingTimes &&
            typeof chartData.tradingTimes === 'object' &&
            JSON.stringify(chartData.tradingTimes) !== this.tradingTimes
        ) {
            this.mainStore.chart.tradingTimes?._calculatingTradingTime(chartData.tradingTimes);
            this.tradingTimes = JSON.stringify(chartData.tradingTimes);
        }
        if (
            chartData?.activeSymbols &&
            typeof chartData.activeSymbols === 'object' &&
            JSON.stringify(chartData.activeSymbols) !== this.activeSymbols
        ) {
            this.activeSymbols = JSON.stringify(chartData.activeSymbols);
            this.mainStore.chart.activeSymbols?.computeActiveSymbols(chartData.activeSymbols);
        }

        this.chartStatusListener = chartStatusListener;
        this.stateChangeListener = stateChangeListener;
        this.isAnimationEnabled = isAnimationEnabled;
        this.isConnectionOpened = isConnectionOpened;
        this.isStaticChart = isStaticChart;
        this.margin = margin;
        this.has_updated_settings = !isDeepEqual(this.settings?.whitespace, settings?.whitespace);
        this.settings = settings;
        this.should_show_eu_content = should_show_eu_content;
        this.shouldFetchTradingTimes = shouldFetchTradingTimes;
        this.shouldFetchTickHistory = shouldFetchTickHistory;
        this.allowTickChartTypeOnly = allowTickChartTypeOnly;
        this.allTicks = allTicks;
        this.contractInfo = contractInfo;
        this.showLastDigitStats = showLastDigitStats;
        this.getIndicatorHeightRatio = getIndicatorHeightRatio;

        const feed = this.mainStore.chart.feed;
        if (shouldDrawTicksFromContractInfo && feed && contractInfo.tick_stream) {
            this.shouldDrawTicksFromContractInfo = shouldDrawTicksFromContractInfo;
            feed.appendChartDataFromPOCResponse.call(feed, contractInfo);
        }

        if (
            networkStatus &&
            (!this.mainStore.chart.networkStatus || networkStatus.class !== this.mainStore.chart.networkStatus.class)
        ) {
            this.mainStore.chart.networkStatus = networkStatus;
        }

        if (chartControlsWidgets !== this.chartControlsWidgets) {
            this.chartControlsWidgets = chartControlsWidgets;
        }

        if (enabledChartFooter !== this.enabledChartFooter) {
            this.enabledChartFooter = enabledChartFooter;
        }

        if (symbol !== this.symbol) {
            this.symbol = symbol;
            isSymbolChanged = true;

            this.mainStore.chartTitle.hidePrice();
        }

        if (chartType && chartType !== this.chartType) {
            if (chartType === 'table') this.prevChartType = this.chartTypeStore.type.id;
            this.setChartType(chartType);
        }

        if (granularity !== undefined && granularity !== this.granularity) {
            this.setChartGranularity(granularity);

            isGranularityChanged = true;
        }

        if (this.chartStore.activeSymbols && refreshActiveSymbols !== this.refreshActiveSymbols) {
            this.refreshActiveSymbols = refreshActiveSymbols;

            if (this.refreshActiveSymbols) {
                this.chartStore.activeSymbols.retrieveActiveSymbols(this.refreshActiveSymbols);
            }
        }

        if (clearChart !== this.clearChart) {
            this.clearChart = clearChart;
            this.cleanChart();
        }

        // This if statement should be always after setting `this.scrollToEpoch` value
        if (this.startEpoch !== startEpoch || this.endEpoch !== endEpoch) {
            this.startEpoch = startEpoch;
            this.endEpoch = endEpoch;

            if (isStaticChart && this.granularity === this.mainStore.chart.granularity) {
                // Reload the chart if it is a static chart and the granularity hasn't changed
                this.mainStore.chart.newChart();
            } else if (this.mainStore.chart.feed) {
                /* When layout is importing and range is changing as the same time we dont need to set the range,
                   the imported layout witll take care of it. */
                if (!this.scrollToEpoch && !isSymbolChanged && !isGranularityChanged) {
                    this.mainStore.chart.feed.onRangeChanged();
                }
            }
        }

        // Please always assign scrollToEpoch after startEpoch and keep this if statement exactly after above if clause
        if (!isStaticChart && scrollToEpoch !== this.scrollToEpoch) {
            this.scrollToEpoch = scrollToEpoch;
            if (this.mainStore.chart && this.mainStore.chart.feed && !isSymbolChanged && !isGranularityChanged) {
                this.setIsChartScrollingToEpoch(true);
                if (anchorChartToLeft) {
                    setTimeout(() => this.stateChange(STATE.SCROLL_TO_LEFT), 900);
                } else {
                    this.stateChange(STATE.SCROLL_TO_LEFT);
                }
            }
        }

        if (crosshairState !== undefined && crosshairState !== null && crosshairState !== this.crosshairState) {
            this.mainStore.crosshair.setCrosshairState(crosshairState);
            this.crosshairState = crosshairState;
        }

        if (crosshairTooltipLeftAllow !== undefined && this.crosshairTooltipLeftAllow !== crosshairTooltipLeftAllow) {
            this.crosshairTooltipLeftAllow = crosshairTooltipLeftAllow;
        }

        if (zoom) {
            if (zoom === 1) {
                this.mainStore.chartSize.zoomIn();
            } else {
                this.mainStore.chartSize.zoomOut();
            }
        }

        this.mainStore.chartSetting.setSettings(this.settings);

        if (maxTick && this.maxTick !== maxTick) {
            this.maxTick = maxTick;
        }

        if (yAxisMargin && typeof yAxisMargin === 'object') {
            this.yAxisMargin = {
                ...this.yAxisMargin,
                ...yAxisMargin,
            };
        }

        if (should_zoom_out_on_yaxis) {
            const { height_factor, yaxis_margin } = getYAxisScalingParams({
                is_contract_chart: shouldDrawTicksFromContractInfo,
                is_mobile: this.mainStore.chart.isMobile,
                ticks_length: this.mainStore.chart.feed?.quotes.length,
                yaxis_height: this.mainStore.chart.chartContainerHeight,
            });
            this.yAxisMargin = {
                ...this.yAxisMargin,
                ...yaxis_margin,
            };
            this.heightFactor = height_factor;
        }

        if (enableScroll !== null && this.enableScroll !== enableScroll) {
            this.enableScroll = enableScroll;
        }

        if (enableZoom !== null && this.enableZoom !== enableZoom) {
            this.enableZoom = enableZoom;
        }

        if (isLive != null && isLive != undefined && this.mainStore.chart.isLive != isLive) {
            this.mainStore.chart.isLive = isLive;
            this.mainStore.chartAdapter.updateLiveStatus(isLive);
        }

        if (
            startWithDataFitMode != null &&
            startWithDataFitMode != undefined &&
            this.mainStore.chart.startWithDataFitMode != startWithDataFitMode
        ) {
            this.mainStore.chart.startWithDataFitMode = startWithDataFitMode;
        }

        if (this.mainStore.chart.leftMargin != leftMargin) {
            this.mainStore.chart.leftMargin = leftMargin;
            this.mainStore.chartAdapter.updateLeftMargin(leftMargin);
        }
    }

    setIsChartScrollingToEpoch(isScrollingToEpoch: boolean) {
        this.isChartScrollingToEpoch = isScrollingToEpoch;
    }

    setChartClosed(isClosed: boolean) {
        this.isChartClosed = isClosed;
        this.stateChange(STATE.MARKET_STATE_CHANGE, { symbol: this.symbol, isClosed });
    }

    setChartTheme(theme: string) {
        if (this.rootElement) {
            (this.rootElement?.querySelector('.chartContainer') as HTMLElement).style.backgroundColor =
                Theme[`${theme}_chart_bg`];
        }
    }

    stateChange(tag: string, option?: TStateChangeOption) {
        if (this.stateChangeListener && typeof this.stateChangeListener === 'function') {
            this.stateChangeListener(tag, option);
        }
    }

    setChartIsReady(isChartReady: boolean) {
        if (this.isChartReady !== isChartReady) {
            this.isChartReady = isChartReady;

            if (isChartReady) {
                this.chartStore.setResizeEvent();
                this.stateChange(STATE.READY);
            }

            if (this.chartStatusListener && typeof this.chartStatusListener === 'function') {
                this.chartStatusListener(isChartReady);
            }
        }
    }

    setChartGranularity(granularity: TGranularity) {
        const isTimeUnitSecond = calculateTimeUnitInterval(granularity).timeUnit === 'second';
        const isChartTypeCandle =
            this.mainStore.chartType.isCandle ||
            (this.chartType && this.mainStore.chartType.isTypeCandle(this.chartType));

        this.mainStore.chartAdapter.setMsPerPx(undefined);

        if (this.context && isTimeUnitSecond && isChartTypeCandle) {
            this.setChartType('line'); // if granularity is zero, set the chartType to 'line'
        }
        this.granularity = granularity === null ? undefined : granularity;
    }

    setChartType(chartType: string | undefined) {
        this.chartType = chartType;
        if (this.chartType) {
            this.mainStore.chartAdapter.updateChartStyle(this.chartType);
        }
        if (this.chartTypeStore.onChartTypeChanged) {
            this.chartTypeStore.onChartTypeChanged(chartType);
        }
    }

    setShouldMinimiseLastDigit(status: boolean) {
        this.shouldMinimiseLastDigits = status;
    }

    saveLayout() {
        if (!this.chartStore.chartId) return;
        const layoutData: TLayout = this.mainStore.view.getLayout();
        const id = this.mainStore.chart.chartId;

        saveToLocalStorage(`chart-layout-${id}`, {
            studyItems: layoutData.studyItems,
            crosshair: layoutData.crosshair,
            msPerPx: layoutData.msPerPx,
        });
    }
    // returns false if restoring layout fails
    restoreLayout() {
        const id = this.mainStore.chart.chartId;
        const layout: TLayout = createObjectFromLocalStorage(`chart-layout-${id}`);

        if (!layout) {
            this.clearLayout();
            return false;
        }

        this.mainStore.view.restoreLayout(layout);

        return true;
    }

    clearLayout() {
        window.flutterChart?.indicators.clearIndicators();
        window.flutterChart?.drawingTool.clearDrawingTool();
    }

    saveDrawings() {
        if (!this.chartStore.chartId) return;
        const layoutData: TLayout = this.mainStore.view.getLayout();
        const id = this.mainStore.chart.chartId;

        saveToLocalStorage(`chart-layout-${id}`, {
            crosshair: layoutData.crosshair,
            studyItems: layoutData.studyItems,
            msPerPx: layoutData.msPerPx,
        });
    }

    cleanChart() {
        if (!this.clearChart || !this.isChartReady) return;

        this.mainStore.studies.deleteAllStudies();

        // TODO: use constant
        this.mainStore.crosshair.onCrosshairChanged(2);
    }

    debouncedStateChange = debounce((state: string, option: TStateChangeOption) => {
        this.stateChange(state, option);
    }, 500);
}

export default ChartState;
