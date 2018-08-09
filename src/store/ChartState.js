import { createObjectFromLocalStorage, calculateTimeUnitInterval, calculateGranularity } from '../utils';

class ChartState {
    get stxx() {
        return this.chartStore.stxx;
    }

    constructor(chartStore) {
        this.chartStore = chartStore;
        this.id = chartStore.id;
        this.stxx.addEventListener('layout', this.saveLayout.bind(this));
        this.stxx.addEventListener('symbolChange', this.saveLayout.bind(this));
        this.stxx.addEventListener('drawing', this.saveDrawings.bind(this));
        this.stxx.addEventListener('preferences', this.savePreferences.bind(this));
    }

    saveLayout() {
        const layoutData = this.stxx.exportLayout(true);
        const json = JSON.stringify(layoutData);
        CIQ.localStorageSetItem(`layout-${this.id}`, json);
    }

    // returns false if restoring layout fails
    restoreLayout() {
        let layoutData = createObjectFromLocalStorage(`layout-${this.id}`);

        if (!layoutData) return false;

        // prop values will always take precedence
        const { symbol, granularity, chartType, startEpoch, endEpoch } = this.chartStore.paramProps;

        if (symbol !== undefined && symbol !== layoutData.symbols[0].symbol) {
            // symbol prop takes precedence over local storage data
            const symbolObject = this.chartStore.activeSymbols.find(x => x.symbol === symbol);
            layoutData.symbols = [{ symbol, symbolObject }];
        }

        for (const symbolDat of layoutData.symbols) {
            // Symbol from cache may be in different language, so replace it with server's
            const { symbol: cachedSymbol } = symbolDat;
            const updatedSymbol = this.chartStore.activeSymbols.find(x => cachedSymbol === x.symbol);
            symbolDat.symbolObject = updatedSymbol;
        }

        if (granularity !== undefined) {
            const periodicity = calculateTimeUnitInterval(granularity);
            layoutData = { ...layoutData, ...periodicity };
        } else {
            // update this.granularity with chartLayout
            const { timeUnit, interval } = layoutData;
            if (timeUnit) {
                this.chartStore.granularity = calculateGranularity(interval, timeUnit);
            } else {
                this.chartStore.granularity = 86400; // 1 day
            }
        }

        if (startEpoch || endEpoch) {
            // already set in chart params
            delete layoutData.span;
            delete layoutData.range;
        }

        if (chartType !== undefined) {
            delete layoutData.chartType;
        }

        this.stxx.importLayout(layoutData, {
            managePeriodicity: true,
            cb: () => {
                if (layoutData.tension) {
                    this.stxx.chart.tension = layoutData.tension;
                }
                this.restoreDrawings(this.stxx, this.stxx.chart.symbol);
                if (this.chartStore.loader) {
                    this.chartStore.loader.hide();
                }
            },
        });

        this.chartStore.updateCurrentActiveSymbol();

        return true;
    }

    saveDrawings() {
        const obj = this.stxx.exportDrawings();
        const symbol = this.stxx.chart.symbol;
        if (obj.length === 0) {
            CIQ.localStorage.removeItem(symbol);
        } else {
            CIQ.localStorageSetItem(symbol, JSON.stringify(obj));
        }
    }

    restoreDrawings() {
        const drawings = createObjectFromLocalStorage(this.stxx.chart.symbol);
        if (drawings) {
            this.stxx.importDrawings(drawings);
            this.stxx.draw();
        }
    }

    restorePreferences() {
        const pref = createObjectFromLocalStorage(`preferences-${this.id}`);
        if (pref) {
            this.stxx.importPreferences(pref);
        }
    }

    savePreferences() {
        CIQ.localStorageSetItem(
            `preferences-${this.id}`,
            JSON.stringify(this.stxx.exportPreferences()),
        );
    }
}

export default ChartState;
