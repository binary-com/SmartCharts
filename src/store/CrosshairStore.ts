import { action, computed, observable, when, makeObservable } from 'mobx';
import Context from 'src/components/ui/Context';
import { TQuote } from 'src/types';
import MainStore from '.';
import Theme from '../../sass/_themes.scss';
import { sameBar } from '../utils';

type TDupMap = {
    [key: string]: number;
};

type TRow = {
    name: string;
    value: string;
};

type TUpdateTooltipPositionParams = {
    left: number;
    top: number;
    rows: TRow[] | null;
};

type TBarData = {
    Ask?: number;
    Bid?: number;
    Close: number;
    DT: Date;
    Date: string;
    High?: number;
    Low?: number;
    Open?: number;
    atr: number;
    cache: { Close: number };
    candleWidth: number | null;
    chartJustAdvanced?: boolean;
    displayDate: Date;
    'hl/2': number;
    'hlc/3': number;
    'hlcc/4': number;
    iqPrevClose: number;
    'ohlc/4': number;
    ratio: number;
    tick: number;
    tickAnimationProgress?: number;
    trueRange: number;
};

const MAX_TOOLTIP_WIDTH = 315;
class CrosshairStore {
    mainStore: MainStore;
    prev_arrow?: string;

    state: number | null = 2;
    constructor(mainStore: MainStore) {
        makeObservable(this, {
            activeSymbol: computed,
            decimalPlaces: computed,
            state: observable,
            toggleState: action.bound,
            updateProps: action.bound,
            setCrosshairState: action.bound,
        });

        this.mainStore = mainStore;
        when(() => !!this.context, this.onContextReady);
    }
    get activeSymbol() {
        return this.mainStore.chart.currentActiveSymbol;
    }
    get decimalPlaces() {
        return this.activeSymbol?.decimal_places;
    }
    get showOhl(): boolean {
        return this.stx.layout.timeUnit !== 'second';
    }
    get context(): Context | null {
        return this.mainStore.chart.context;
    }
    get stx(): Context['stx'] {
        return this.context?.stx;
    }
    get isChartReady() {
        return this.mainStore.state.isChartReady;
    }

    node = null;
    lastBar = {};
    showChange = false;
    showSeries = true;
    showStudies = true;
    onCrosshairChanged: (state?: number | null) => void | null = () => null;
    onContextReady = () => {
        const storedState = this.stx.layout.crosshair;
        const state = typeof storedState !== 'number' ? 2 : storedState;
        this.setCrosshairState(state);
        this.stx.append('headsUpHR', this.renderCrosshairTooltip);
    };
    setFloatPriceLabelStyle(theme = this.mainStore.chartSetting.theme) {
        const crosshair = this.stx.container.querySelector('.cq-crosshair');
        if (this.state === 2) {
            this.stx.setStyle('stx-float-price', 'color', 'transparent');
            this.stx.setStyle('stx-float-price', 'background-color', 'transparent');
            this.stx.controls.floatDate.style.color = 'transparent';
            this.stx.controls.floatDate.style.backgroundColor = 'transparent';
            this.stx.controls.floatDate.style.display = 'none';
            this.stx.controls.crossX.style.height = `calc(100% - ${this.stx.xaxisHeight}px)`;
            crosshair.classList.add('active');
        } else {
            this.stx.setStyle('stx-float-price', 'color', Theme[`${theme}_float_labels_text`]);
            this.stx.setStyle('stx-float-price', 'background-color', Theme[`${theme}_float_labels_bg`]);
            this.stx.controls.floatDate.style.color = Theme[`${theme}_float_labels_text`];
            this.stx.controls.floatDate.style.backgroundColor = Theme[`${theme}_float_labels_bg`];
            this.stx.controls.floatDate.style.display = 'block';
            this.stx.controls.crossX.style.height = '100%';
            crosshair.classList.remove('active');
        }
    }
    toggleState() {
        const state = ((this.state as number) + 1) % 3;
        this.setCrosshairState(state);
    }
    updateProps(onChange?: () => void) {
        this.onCrosshairChanged = onChange || (() => null);
    }
    setCrosshairState(state: number | null) {
        if (!this.context) {
            return;
        }
        this.state = state;
        this.setFloatPriceLabelStyle();
        this.stx.layout.crosshair = state;
        this.stx.doDisplayCrosshairs();
        this.mainStore.state.crosshairState = state;
        this.mainStore.state.saveLayout();
        this.onCrosshairChanged(this.state);
    }
    renderCrosshairTooltip = () => {
        // if no tooltip exists, then skip
        if (this.state !== 2 || !this.context?.stx) return;

        const stx = this.stx;
        const { crossX, crossY } = stx.controls;
        // crosshairs are not on
        if ((crossX && crossX.style.display === 'none') || (crossY && crossY.style.display === 'none')) {
            return;
        }
        const bar = stx.barFromPixel(stx.cx);
        const data = stx.chart.dataSegment[bar];
        if (!data || !this.isChartReady) {
            this.updateTooltipPosition({ left: -5000, top: 0, rows: null });
            return;
        }
        const showOverBarOnly = false;
        let goodBar;
        let overBar = true;
        let highPx, lowPx;
        if (data !== undefined && data && data.DT) {
            goodBar = true;
            if (data.High) {
                highPx = stx.pixelFromPrice(data.High);
            }
            if (data.Low) {
                lowPx = stx.pixelFromPrice(data.Low);
            }
            if (!stx.chart.highLowBars) {
                if (data.Close) {
                    highPx = stx.pixelFromPrice(data.Close) - 15;
                    lowPx = stx.pixelFromPrice(data.Close) + 15;
                }
            }
            if (showOverBarOnly && !(stx.cy >= highPx && stx.cy <= lowPx)) {
                overBar = false;
            }
        }
        if (
            !(
                stx.insideChart &&
                stx.layout.crosshair &&
                stx.displayCrosshairs &&
                !stx.overXAxis &&
                !stx.overYAxis &&
                !stx.openDialog &&
                !stx.activeDrawing &&
                !stx.grabbingScreen &&
                goodBar &&
                overBar
            )
        ) {
            this.updateTooltipPosition({ left: -5000, top: 0, rows: null });
            this.lastBar = {};
            return;
        }
        let rows = null;
        if (!(sameBar(data, this.lastBar as TQuote) && bar !== stx.chart.dataSegment.length - 1)) {
            rows = this.calculateRows(data);
            this.lastBar = data;
        }
        this.updateTooltipPosition({
            left: CIQ.ChartEngine.crosshairX - this.stx.left,
            top: CIQ.ChartEngine.crosshairY - this.stx.top,
            rows,
        });
    };
    calculateRows(data: TBarData) {
        const { stx } = this;
        const dupMap = {} as TDupMap;
        const fields = [];
        {
            // Access main chart panel and yAxis in this scope:
            const { panel } = stx.chart;
            const { yAxis } = panel;
            fields.push({
                member: 'DT',
                display: 'DT',
                panel,
                yAxis,
            });
            dupMap.DT = dupMap.Close = 1;
            if (this.showChange && CIQ.ChartEngine.isDailyInterval(stx.layout.interval)) {
                fields.push({
                    member: 'Change',
                    display: 'Change',
                    panel,
                    yAxis,
                });
            }
            if (this.showOhl) {
                for (const el of ['Open', 'Close', 'High', 'Low']) {
                    fields.push({
                        member: el,
                        display: el,
                        panel,
                        yAxis,
                    });
                }
                dupMap.Open = dupMap.High = dupMap.Low = 1;
            }
        }
        if (this.showSeries && !this.showOhl) {
            const renderers = stx.chart.seriesRenderers;
            for (const renderer in renderers) {
                const rendererToDisplay = renderers[renderer];
                const panel = stx.panels[rendererToDisplay.params.panel];
                let { yAxis } = rendererToDisplay.params;
                if (!yAxis && rendererToDisplay.params.shareYAxis) {
                    yAxis = panel.yAxis;
                }
                for (let id = 0; id < rendererToDisplay.seriesParams.length; id++) {
                    const seriesParams = rendererToDisplay.seriesParams[id];
                    if (seriesParams.display === this.activeSymbol?.symbol) {
                        const display = this.activeSymbol?.name;
                        fields.push({
                            member: 'Close',
                            display,
                            panel,
                            yAxis,
                        });
                        dupMap[display as string] = 1;
                    } else {
                        // if a series has a symbol and a field then it maybe a object chain
                        let sKey = seriesParams.symbol;
                        const subField = seriesParams.field;
                        if (!sKey) {
                            sKey = subField;
                        } else if (subField && sKey !== subField) {
                            sKey = CIQ.createObjectChainNames(sKey, subField)[0];
                        }
                        const display = seriesParams.display || seriesParams.symbol || seriesParams.field;
                        if (display && sKey && (!dupMap[display] || seriesParams.symbol === undefined)) {
                            fields.push({
                                member: sKey,
                                display,
                                panel,
                                yAxis,
                            });
                            dupMap[display] = 1;
                        }
                    }
                }
            }
        }
        if (this.showStudies) {
            const { studies } = stx.layout;
            for (const study in studies) {
                const panel = stx.panels[studies[study].panel];
                const yAxis = panel.yAxis;
                for (const output in studies[study].outputMap) {
                    if (output && !dupMap[output]) {
                        fields.push({
                            member: output,
                            display: output,
                            panel,
                            yAxis,
                        });
                        dupMap[output] = 1;
                    }
                }
                const hist = `${study}_hist`;
                if (!dupMap[hist]) {
                    fields.push({
                        member: hist,
                        display: hist,
                        panel,
                        yAxis,
                    });
                    const hist1 = `${study}_hist1`;
                    const hist2 = `${study}_hist2`;
                    fields.push({
                        member: hist1,
                        display: hist1,
                        panel,
                        yAxis,
                    });
                    fields.push({
                        member: hist2,
                        display: hist2,
                        panel,
                        yAxis,
                    });
                    dupMap[hist] = 1;
                }
            }
        }
        const rows = [];
        for (const obj of fields) {
            const { member: name, display: displayName, panel, yAxis } = obj;
            let labelDecimalPlaces = this.decimalPlaces;
            if (yAxis) {
                if (panel !== panel.chart.panel) {
                    // If a study panel, use yAxis settings to determine decimal places
                    if (yAxis.decimalPlaces || yAxis.decimalPlaces === 0) {
                        labelDecimalPlaces = yAxis.decimalPlaces;
                    } else if (yAxis.maxDecimalPlaces || yAxis.maxDecimalPlaces === 0) {
                        labelDecimalPlaces = yAxis.maxDecimalPlaces;
                    }
                } else {
                    // If a chart panel, then always display at least the number of decimal places as calculated by masterData (panel.chart.decimalPlaces)
                    // but if we are zoomed to high granularity then expand all the way out to the y-axis significant digits (panel.yAxis.printDecimalPlaces)
                    labelDecimalPlaces = Math.max(yAxis.printDecimalPlaces, panel.chart.decimalPlaces);
                    // ... and never display more decimal places than the symbol is supposed to be quoting at
                    if (yAxis.maxDecimalPlaces || yAxis.maxDecimalPlaces === 0) {
                        labelDecimalPlaces = Math.min(labelDecimalPlaces, yAxis.maxDecimalPlaces);
                    }
                }
            }
            let dsField = null;
            // account for object chains
            const tuple = CIQ.existsInObjectChain(data, name);
            if (tuple) {
                dsField = tuple.obj[tuple.member];
            } else if (name === 'Change') {
                dsField = data.Close - data.iqPrevClose;
            }

            const fieldName = displayName?.replace(/^(Result )(.*)/, '$2');
            if (
                (dsField || dsField === 0) &&
                (name === 'DT' || typeof dsField !== 'object' || dsField.Close || dsField.Close === 0)
            ) {
                let fieldValue = '';
                if (dsField.Close || dsField.Close === 0) {
                    dsField = dsField.Close;
                }
                if (dsField.constructor === Number) {
                    if (!yAxis) {
                        // raw value
                        fieldValue = dsField.toFixed(labelDecimalPlaces);
                    } else if (yAxis.originalPriceFormatter && yAxis.originalPriceFormatter.func) {
                        // in comparison mode with custom formatter
                        fieldValue = yAxis.originalPriceFormatter.func(stx, panel, dsField, labelDecimalPlaces);
                    } else if (yAxis.priceFormatter && yAxis.priceFormatter !== CIQ.Comparison.priceFormat) {
                        // using custom formatter
                        fieldValue = yAxis.priceFormatter(stx, panel, dsField, labelDecimalPlaces);
                    } else {
                        fieldValue = stx.formatYAxisPrice(dsField, panel, labelDecimalPlaces, yAxis);
                    }
                } else if (dsField.constructor === Date) {
                    const { floatDate } = stx.controls;
                    if (name === 'DT' && floatDate && floatDate.innerHTML) {
                        if (stx.chart.xAxis.noDraw) {
                            continue;
                        } else {
                            const formattedTime = floatDate.innerHTML.replace(/(\d{2})\/(\d{2})/, '$2/$1');
                            fieldValue = formattedTime;
                        }
                    } else {
                        fieldValue = CIQ.yyyymmdd(dsField);
                        if (!CIQ.ChartEngine.isDailyInterval(stx.layout.interval)) {
                            fieldValue += ` ${dsField.toTimeString().substr(0, 8)}`;
                        }
                    }
                } else {
                    fieldValue = dsField;
                }
                rows.push({
                    name: fieldName ? fieldName.toUpperCase() : '',
                    value: fieldValue,
                });
            }
        }
        return rows;
    }
    updateVisibility = (visible: boolean) => {
        const crosshair = this.stx.container.querySelector('.cq-crosshair');
        if (this.state === 2 && visible) crosshair.classList.add('active');
        else if (this.state === 2) crosshair.classList.remove('active');
    };
    // YES! we are manually patching DOM, Because we don't want to pay
    // for react reconciler & mox tracking observables.
    updateTooltipPosition({ top, left, rows }: TUpdateTooltipPositionParams) {
        const crosshair = this.stx.container.querySelector('.cq-crosshair');
        crosshair.style.transform = `translate(${left}px, ${top}px)`;
        const tooltipRightLimit = this.mainStore.state.crosshairTooltipLeftAllow || MAX_TOOLTIP_WIDTH;
        const arrow = left <= tooltipRightLimit ? 'arrow-left' : 'arrow-right';
        if (arrow !== this.prev_arrow) {
            crosshair.classList.remove(this.prev_arrow);
            crosshair.classList.add(arrow);
            this.prev_arrow = arrow;
        }
        // if there is a need to update the rows.
        if (rows !== null) {
            const content = crosshair.querySelector('.cq-crosshair-content');
            content.innerHTML = rows
                .map(
                    (r: TRow) => `
                <div class="row">
                    <span>${r.name !== 'DT' ? r.name : r.value}</span>
                    <span>${r.name !== 'DT' ? r.value : ''}</span>
                </div>
            `
                )
                .join('');
        }
    }
}
export default CrosshairStore;
