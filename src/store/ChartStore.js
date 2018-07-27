import ResizeObserver from 'resize-observer-polyfill';
import { action, observable } from 'mobx';
import PendingPromise from '../utils/PendingPromise';
import Context from '../components/ui/Context';
import KeystrokeHub from '../components/ui/KeystrokeHub';
import '../components/ui/Animation';
import { BinaryAPI, Feed } from '../feed';
import { createObjectFromLocalStorage, stableSort } from '../utils';

// import '../AddOns';

class ChartStore {
    static _id_counter = 0;

    constructor(mainStore) {
        this.id = ++ChartStore._id_counter;
        this.mainStore = mainStore;
    }

    onSymbolChange = null;
    contextPromise = new PendingPromise();
    activeSymbols = [];
    rootNode = null;
    stxx = null;
    id = null;
    defaultSymbol = 'R_100';
    enableRouting = null;
    chartNode = null;
    chartControlsNode = null;
    chartContainerNode = null;
    holderStyle;
    @observable containerWidth = null;
    @observable context = null;
    @observable currentActiveSymbol;
    @observable isChartAvailable = true;
    @observable comparisonSymbols = [];
    @observable categorizedSymbols = [];
    @observable barrierJSX;
    @observable chartPanelTop = 0;
    @observable chartHeight;
    @observable chartContainerHeight;
    @observable isMobile = false;

    @action.bound setActiveSymbols(activeSymbols) {
        this.activeSymbols = this.processSymbols(activeSymbols);
        this.categorizedSymbols = this.categorizeActiveSymbols();
    }

    get loader() { return this.mainStore.loader; }
    get routingStore() {
        return this.mainStore.routing;
    }
    saveLayout() {
        const layoutData = this.stxx.exportLayout(true);
        const json = JSON.stringify(layoutData);
        CIQ.localStorageSetItem(`layout-${this.id}`, json);
    }

    restoreLayout(stx, layoutData) {
        if (!layoutData) { return; }

        stx.importLayout(layoutData, {
            managePeriodicity: true,
            cb: () => {
                if (layoutData.tension) { stx.chart.tension = layoutData.tension; }
                this.restoreDrawings(stx, stx.chart.symbol);
                if (this.loader) { this.loader.hide(); }
            },
        });
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

    updateHeight(position) {
        const panelPosition = position || this.mainStore.chartSetting.position;
        const offsetHeight = (panelPosition === 'left') ? 0 : this.chartControlsNode.offsetHeight;
        this.chartHeight = this.chartNode.offsetHeight;
        this.chartContainerHeight = this.chartHeight - offsetHeight;
    }

    updateCanvas = () => {
        if (this.stxx.slider) {
            this.stxx.slider.display(this.stxx.layout.rangeSlider);
        }
        this.stxx.resizeChart();
    };

    @action.bound resizeScreen() {
        if (!this.context) { return; }


        if (this.modalNode.clientWidth > 1100) {
            this.containerWidth = 1100;
        } else if (this.modalNode.clientWidth > 900) {
            this.containerWidth = 900;
        } else {
            this.containerWidth = 480;
        }


        this.updateHeight();
        // Height updates are not immediate, so we must resize the canvas with
        // a slight delay for it to pick up the correct chartContainer height.
        // In mobile devices, a longer delay is given as DOM updates are slower.
        setTimeout(this.updateCanvas, this.isMobile ? 500 : 100);
    }

    @action.bound init(rootNode, modalNode, props) {
        this.rootNode = rootNode;
        this.modalNode = modalNode;
        this.chartNode = this.rootNode.querySelector('.ciq-chart-area');
        this.chartControlsNode = this.rootNode.querySelector('.cq-chart-controls');

        const {
            onSymbolChange,
            initialSymbol,
            requestAPI,
            requestSubscribe,
            requestForget,
            isMobile,
            shareOrigin = 'https://charts.binary.com',
            enableRouting,
            settings,
            onSettingsChange,
        } = props;
        const api = new BinaryAPI(requestAPI, requestSubscribe, requestForget);
        const { share, chartSetting } = this.mainStore;
        share.shareOrigin = shareOrigin;
        chartSetting.setSettings(settings);
        chartSetting.onSettingsChange = onSettingsChange;
        this.isMobile = isMobile;
        this.onSymbolChange = onSymbolChange;

        const stxx = this.stxx = new CIQ.ChartEngine({
            markerDelay: null, // disable 25ms delay for placement of markers
            container: this.rootNode.querySelector('.chartContainer.primary'),
            controls: { chartControls: null }, // hide the default zoom buttons
            preferences: {
                currentPriceLine: true,
            },
            chart: {
                yAxis: {
                    // Put some top margin so chart doesn't get blocked by chart title
                    initialMarginTop: 125,
                    initialMarginBottom: 10,
                },
            },
            minimumLeftBars: 15,
            minimumZoomTicks: 20,
            yTolerance: 999999, // disable vertical scrolling
        });

        const deleteElement = stxx.chart.panel.holder.parentElement.querySelector('#mouseDeleteText');
        const manageElement = stxx.chart.panel.holder.parentElement.querySelector('#mouseManageText');
        const manageTouchElement = stxx.chart.panel.holder.parentElement.querySelector('#overlayTrashCan');
        deleteElement.textConent = t.translate('right-click to delete');
        manageElement.textConent = t.translate('right-click to manage');
        manageTouchElement.textContent = t.translate('tap to manage');

        // Animation (using tension requires splines.js)
        CIQ.Animation(stxx, { stayPut: true });

        // connect chart to data
        this.feed = new Feed(api, stxx, this.mainStore);
        stxx.attachQuoteFeed(this.feed, {
            refreshInterval: null,
        });

        this.enableRouting = enableRouting;
        if (this.enableRouting) {
            this.routingStore.handleRouting();
        }

        // Extended hours trading zones
        // new CIQ.ExtendedHours({
        //     stx: stxx,
        //     filter: true,
        // });

        // Inactivity timer
        // new CIQ.InactivityTimer({
        //     stx: stxx,
        //     minutes: 30,
        // });

        this.holderStyle = stxx.chart.panel.holder.style;

        stxx.append('deleteHighlighted', this.updateComparisons);
        stxx.addEventListener('layout', () => {
            this.saveLayout();
            this.updateChartPanelTop();
        });
        stxx.addEventListener('symbolChange', this.saveLayout.bind(this));
        stxx.addEventListener('drawing', this.saveDrawings.bind(this));
        stxx.addEventListener('newChart', this.updateChartPanelTop);
        stxx.addEventListener('preferences', this.savePreferences.bind(this));

        const context = new Context(stxx, this.rootNode);

        new KeystrokeHub(document.querySelector('body'), context, { // eslint-disable-line no-new
            cb: KeystrokeHub.defaultHotKeys,
        });

        const UIStorage = new CIQ.NameValueStore(); // eslint-disable-line no-unused-vars

        // TODO: excluded studies
        const params = { // eslint-disable-line no-unused-vars
            excludedStudies: {
                Directional: true,
                Gopala: true,
                vchart: true,
            },
            alwaysDisplayDialog: {
                ma: true,
            },
            /* dialogBeforeAddingStudy: {"rsi": true} // here's how to always show a dialog before adding the study */
        };

        this.loader.show();

        const studiesStore = this.mainStore.studies;
        stxx.callbacks.studyOverlayEdit = study => studiesStore.editStudy(study);
        stxx.callbacks.studyPanelEdit = study => studiesStore.editStudy(study);

        this.restorePreferences();

        api.getActiveSymbols().then(({ active_symbols }) => {
            let layoutData = createObjectFromLocalStorage(`layout-${this.id}`);

            // if initialSymbol is different from local storage layoutData, it takes
            // precedence over layoutData.symbols. Note that layoutData retrieved
            // from URL will take precedence over initialSymbol
            if (initialSymbol && layoutData && layoutData.symbols[0].symbol !== initialSymbol) {
                // If symbol in layoutData.symbol[0] and initialSymbol are different,
                // restoreLayout and changeSymbol cannot be executed together or
                // chartIQ will stream both symbols in the the same chart
                delete layoutData.symbols;
            }

            const onLayoutDataReady = () => {
                this.restoreLayout(stxx, layoutData);

                this.setActiveSymbols(active_symbols);

                if (initialSymbol && !(layoutData && layoutData.symbols)) {
                    this.changeSymbol(initialSymbol);
                } else if (stxx.chart.symbol) {
                    this.setCurrentActiveSymbols(stxx);
                    if (this.onSymbolChange) { this.onSymbolChange(this.currentActiveSymbol); }
                } else {
                    this.changeSymbol(this.defaultSymbol);
                }
                this.setLayoutData(context);
            };
            const href = window.location.href;
            if (href.startsWith(shareOrigin) && href.indexOf('#') !== -1) {
                const encodedJsonPart = href.split('#').slice(1).join('#');
                const url = href.split('#')[0];
                const hash = url.split('?')[1];

                if (hash) {
                    window.history.replaceState({}, document.title, window.location.pathname);
                    const promise = this.mainStore.share.expandBitlyAsync(hash, decodeURIComponent(encodedJsonPart));
                    promise.then((encodedJson) => {
                        layoutData = JSON.parse(encodedJson);
                        onLayoutDataReady();
                    }).catch(() => onLayoutDataReady());
                } else {
                    onLayoutDataReady();
                }
            } else {
                onLayoutDataReady();
            }
        });

        this.resizeObserver = new ResizeObserver(this.resizeScreen);
        this.resizeObserver.observe(modalNode);

        this.feed.onComparisonDataUpdate(this.updateComparisons);
    }
    removeComparison(symbolObj) {
        this.context.stx.removeSeries(symbolObj.symbol);
        this.updateComparisons();
    }
    @action.bound setLayoutData(context) {
        this.context = context;
        this.contextPromise.resolve(this.context);
        this.resizeScreen();
        this.updateChartPanelTop();
    }

    @action.bound updateChartPanelTop() {
        if (this.holderStyle === undefined) { return; }
        this.chartPanelTop = this.holderStyle.top;
    }

    @action.bound setCurrentActiveSymbols(stxx) {
        this.currentActiveSymbol = stxx.chart.symbolObject;
        stxx.chart.yAxis.decimalPlaces = stxx.chart.symbolObject.decimal_places;
        this.categorizedSymbols = this.categorizeActiveSymbols();
    }
    @action.bound setChartAvailability(status) {
        this.isChartAvailable = status;
    }

    @action.bound changeSymbol(symbolObj) {
        if (typeof symbolObj === 'string') {
            symbolObj = this.activeSymbols.find(s => s.symbol === symbolObj);
        }

        if (this.currentActiveSymbol
            && symbolObj.symbol === this.currentActiveSymbol.symbol) {
            return;
        }

        if (this.onSymbolChange) {
            this.onSymbolChange(symbolObj);
        }

        this.loader.show();

        // reset comparisons
        this.comparisonSymbols = [];
        for (const field in this.stxx.chart.series) {
            if (this.stxx.chart.series[field].parameters.bucket !== 'study') {
                this.stxx.removeSeries(field);
            }
        }

        this.stxx.newChart(symbolObj, null, null, (err) => {
            this.loader.hide();
            if (err) {
                /* TODO, symbol not found error */
                return;
            }
            this.restoreDrawings();
        });

        this.stxx.chart.yAxis.decimalPlaces = symbolObj.decimal_places;
        this.currentActiveSymbol = symbolObj;
        this.categorizedSymbols = this.categorizeActiveSymbols();
    }

    @action.bound updateComparisons() {
        if (!this.context) { return; }
        const stx = this.context.stx;
        const comparisonSymbolsKeys = Object.keys(stx.chart.series);
        if (comparisonSymbolsKeys.length !== this.comparisonSymbols.length) {
            const comparisons = [];
            const q = stx.currentQuote();
            if (q) {
                for (const sybl of comparisonSymbolsKeys) {
                    const srs = stx.chart.series[sybl];
                    const prm = srs.parameters;
                    const price = srs.lastQuote ? srs.lastQuote.Close : undefined;

                    comparisons.push({
                        color: prm.color,
                        price,
                        symbolObject: prm.symbolObject,
                    });
                }
            }
            this.comparisonSymbols = comparisons;
            return;
        }

        // Update the comparison prices:
        let i = 0;
        for (const sybl of comparisonSymbolsKeys) {
            const comp = this.comparisonSymbols[i];
            const srs = stx.chart.series[sybl];
            comp.price = srs.lastQuote ? srs.lastQuote.Close : undefined;
            i++;
        }
    }

    @action.bound destroy() {
        this.resizeObserver.disconnect();
        // Destroying the chart does not unsubscribe the streams;
        // we need to manually unsubscribe them.
        this.feed.unsubscribeAll();
        this.feed = null;
        this.stxx.updateChartData = function () {}; // prevent any data from entering the chart
        this.stxx.isDestroyed = true;
        this.stxx.destroy();
        this.stxx = null;
    }

    processSymbols(symbols) {
        const processedSymbols = [];

        // Stable sort is required to retain the order of the symbol name
        stableSort(symbols, (a, b) => a.submarket_display_name.localeCompare(b.submarket_display_name));

        for (const s of symbols) {
            processedSymbols.push({
                symbol: s.symbol,
                name: s.display_name,
                market: s.market,
                market_display_name: s.market_display_name,
                submarket_display_name: s.submarket_display_name,
                exchange_is_open: s.exchange_is_open,
                decimal_places: s.pip.length - 2,
            });
        }


        // Categorize symbols in order defined by another array; there's probably a more
        // efficient algo for this, but for just ~100 items it's not worth the effort
        const order = ['forex', 'indices', 'stocks', 'commodities', 'volidx'];
        const orderedSymbols = [];
        for (const o of order) {
            for (const p of processedSymbols) {
                if (o === p.market) {
                    orderedSymbols.push(p);
                }
            }
        }
        return orderedSymbols;
    }

    categorizeActiveSymbols() {
        if (this.activeSymbols.length <= 0 || !this.currentActiveSymbol) { return []; }

        const activeSymbols = this.activeSymbols;
        const categorizedSymbols = [];
        if (activeSymbols.length > 0) {
            const first = activeSymbols[0];
            const getSubcategory = d => ({
                subcategoryName: d.submarket_display_name,
                data: [],
            });
            const getCategory = d => ({
                categoryName: d.market_display_name,
                categoryId: d.market,
                hasSubcategory: true,
                data: [],
            });
            let subcategory = getSubcategory(first);
            let category = getCategory(first);
            for (const symbol of activeSymbols) {
                if (category.categoryName !== symbol.market_display_name) {
                    category.data.push(subcategory);
                    categorizedSymbols.push(category);
                    subcategory = getSubcategory(symbol);
                    category = getCategory(symbol);
                }
                if (subcategory.subcategoryName !== symbol.submarket_display_name) {
                    category.data.push(subcategory);
                    subcategory = getSubcategory(symbol);
                }
                const selected = symbol.symbol === this.currentActiveSymbol.symbol;
                subcategory.data.push({
                    enabled: true,
                    selected,
                    itemId: symbol.symbol,
                    display: symbol.name,
                    dataObject: symbol,
                });
            }

            category.data.push(subcategory);
            categorizedSymbols.push(category);
        }

        return categorizedSymbols;
    }
}

export default ChartStore;
