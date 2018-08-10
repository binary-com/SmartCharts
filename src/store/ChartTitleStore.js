import { observable, action, computed, when } from 'mobx';
import MenuStore from './MenuStore';
import AnimatedPriceStore from './AnimatedPriceStore';
import CategoricalDisplayStore from './CategoricalDisplayStore';

export default class ChartTitleStore {
    constructor(mainStore) {
        this.mainStore = mainStore;
        when(() => this.context, this.onContextReady);
        this.menu = new MenuStore(mainStore, { route: 'chart-title' });
        this.animatedPrice = new AnimatedPriceStore();
        this.categoricalDisplay = new CategoricalDisplayStore({
            getCategoricalItems: () => this.mainStore.chart.categorizedSymbols,
            getIsShown: () => this.menu.open,
            placeholderText: t.translate('Search...'),
            favoritesId: 'chartTitle&Comparison',
            mainStore,
        });
    }

    @observable todayChange = null;
    @observable isVisible = false;

    get chart() { return this.mainStore.chart; }
    get context() { return this.mainStore.chart.context; }
    @computed get currentSymbol() { return this.mainStore.chart.currentActiveSymbol; }
    @computed get decimalPlaces() { return this.mainStore.chart.currentActiveSymbol.decimal_places; }
    @computed get isShowChartPrice() { return this.mainStore.chart.isChartAvailable; }

    onContextReady = () => {
        this.chart.feed.onMasterDataUpdate(this.update);
        this.update();
    };

    @action.bound setSymbol(symbolObj) {
        if (this.chart.paramProps.symbol !== undefined) {
            console.error('Changing symbol does nothing because symbol prop is being set. Consider overriding the onChange prop in <ChartTitle />');
            return;
        }

        this.chart.changeSymbol(symbolObj);
    }

    @action.bound update(quote) {
        if (!this.currentSymbol) { return; }

        this.isVisible = quote || !this.isShowChartPrice;
        if (!this.isVisible) { return; }

        let currentPrice = quote.Close;
        if (currentPrice) {
            currentPrice = currentPrice.toFixed(this.decimalPlaces);
            const oldPrice = quote.prevClose || this.animatedPrice.price;
            if (oldPrice !== currentPrice) {
                this.animatedPrice.setPrice(currentPrice);
                if (oldPrice) {
                    this.todayChange = Math.abs(currentPrice - oldPrice).toFixed(this.decimalPlaces);
                }
            }
        }
    }
}
