import { ActiveSymbols as TActiveSymbols, ActiveSymbolsResponse } from '@deriv/api-types';
import { action, computed, observable, runInAction, makeObservable } from 'mobx';
import { TChanges, TChartProps, TInitialChartData } from 'src/types';
import BinaryAPI from './BinaryAPI';
import TradingTimes from './TradingTimes';
import { cloneCategories, stableSort } from '../utils';
import PendingPromise from '../utils/PendingPromise';
import { isDeepEqual } from '../utils/object';

const DefaultSymbols = ['synthetic_index', 'basket_index', 'forex', 'indices', 'stocks', 'cryptocurrency', 'commodities'];

export type TProcessedSymbolItem = {
    symbol: string;
    name: string;
    market: string;
    market_display_name: string;
    subgroup: string;
    subgroup_display_name: string;
    submarket: string;
    submarket_display_name: string;
    exchange_is_open: boolean;
    decimal_places: number;
};

type TProcessedSymbols = TProcessedSymbolItem[];

export type TSubCategoryDataItem = {
    enabled: boolean;
    itemId: string;
    display: string;
    dataObject: TProcessedSymbolItem;
    selected?: boolean;
};

export type TSubCategoryData = TSubCategoryDataItem[];

export type TSubCategory = {
    subcategoryId: string;
    subcategoryName: string;
    data: TSubCategoryDataItem[];
};

export type TCategorizedSymbolItem<T = TSubCategory> = {
    categoryName: string;
    categoryId: string;
    hasSubcategory: boolean;
    hasSubgroup: boolean;
    subgroups: TCategorizedSymbolItem[];
    data: T[];
    active?: boolean;
    emptyDescription?: string;
    categorySubtitle?: string;
    categoryNamePostfixShowIfActive?: string;
    categoryNamePostfix?: string;
};

export type TCategorizedSymbols = TCategorizedSymbolItem[];

type ActiveSymbolsParam = {
    enable?: boolean;
    getMarketsOrder?: TChartProps['getMarketsOrder'];
    activeSymbols?: ActiveSymbolsResponse['active_symbols'];
    chartData?: TInitialChartData;
};

export default class ActiveSymbols {
    _api: BinaryAPI;
    _params: ActiveSymbolsParam;
    _tradingTimes: TradingTimes;
    processedSymbols?: TProcessedSymbols;
    changes: TChanges = {};
    categorizedSymbols: TCategorizedSymbols = [];
    symbolMap: Record<string, TProcessedSymbolItem> = {};
    symbolsPromise = PendingPromise<void, void>();
    isRetrievingSymbols = false;

    constructor(api: BinaryAPI, tradingTimes: TradingTimes, params: ActiveSymbolsParam) {
        makeObservable(this, {
            categorizedSymbols: observable,
            changes: observable,
            retrieveActiveSymbols: action.bound,
            computeActiveSymbols: action.bound,
            activeSymbols: computed,

        })
        this._api = api;
        this._tradingTimes = tradingTimes;
        this._params = params;
    }

    async retrieveActiveSymbols(retrieveNewActiveSymbols = false) {
        if (this.isRetrievingSymbols && !retrieveNewActiveSymbols) {
            await this.symbolsPromise;
            return this.activeSymbols;
        }
        const response = await this._api.getActiveSymbols();
        this.isRetrievingSymbols = true;

        let active_symbols: TActiveSymbols | undefined = [];
        if (this._params.activeSymbols && !this.processedSymbols) {
            active_symbols = this._params.activeSymbols;
        } else if (this._params.enable !== false || !isDeepEqual(response.active_symbols, this._params.activeSymbols)) {
            active_symbols = response.active_symbols;
            this._params.activeSymbols = response.active_symbols;
        } else if (this._params.chartData && this._params.enable === false) {
            // Do not need to do anything, the chartData handle the staff
            console.log('ActiveSymbols would render through chartData.');
            return;
        } else {
            console.error('ActiveSymbols feed is not enable nor has initial data!');
            return;
        }

        if (active_symbols !== undefined) {
            this.computeActiveSymbols(active_symbols);
        }
        this.symbolsPromise.resolve();
        return this.activeSymbols;
    }

    computeActiveSymbols(active_symbols: TActiveSymbols) {
        runInAction(() => {
            this.processedSymbols = this._processSymbols(active_symbols);
            this.categorizedSymbols = this._categorizeActiveSymbols(this.processedSymbols);
        });
        for (const symbolObj of this.processedSymbols || []) {
            this.symbolMap[symbolObj.symbol] = symbolObj;
        }
        this._tradingTimes.onMarketOpenCloseChanged(
            action((changes: TChanges) => {
                for (const symbol in changes) {
                    const symObj = this.symbolMap[symbol];
                    if (symObj) {
                        symObj.exchange_is_open = changes[symbol];
                    }
                }
                this.changes = changes;
            })
        );
    }

    get activeSymbols() {
        return cloneCategories<TSubCategoryDataItem>(this.categorizedSymbols, item => {
            const itemObject = item as TSubCategoryDataItem;
            const { symbol } = itemObject.dataObject;
            if (symbol in this.changes) {
                itemObject.dataObject.exchange_is_open = this.changes[symbol];
            }
            return { ...item };
        });
    }

    getSymbolObj(symbol: string) {
        return this.symbolMap[symbol];
    }

    _processSymbols(symbols: TActiveSymbols): TProcessedSymbols {
        const processedSymbols: TProcessedSymbols = [];

        // Stable sort is required to retain the order of the symbol name
        const sortedSymbols = stableSort(symbols, (a, b) =>
            a.submarket_display_name.localeCompare(b.submarket_display_name)
        );

        for (const s of sortedSymbols) {
            processedSymbols.push({
                symbol: s.symbol,
                name: s.display_name,
                market: s.market,
                market_display_name: s.market_display_name,
                // TODO: stop ignoring these types after BE api types are updated
                // @ts-ignore
                subgroup: s.subgroup,
                // @ts-ignore
                subgroup_display_name: s.subgroup_display_name,
                submarket: s.submarket,
                submarket_display_name: s.submarket_display_name,
                exchange_is_open: !!s.exchange_is_open,
                decimal_places: s.pip.toString().length - 2,
            });
        }

        // Categorize symbols in order defined by another array; there's probably a more
        // efficient algo for this, but for just ~100 items it's not worth the effort
        const orderedMarkets =
            typeof this._params.getMarketsOrder === 'function' ? this._params.getMarketsOrder(symbols) : DefaultSymbols;
        const orderedSymbols = [];
        for (const o of orderedMarkets) {
            for (const p of processedSymbols) {
                if (o === p.market) {
                    orderedSymbols.push(p);
                }
            }
        }

        return orderedSymbols;
    }

    _categorizeActiveSymbols(activeSymbols: TProcessedSymbols): TCategorizedSymbols {
        const categorizedSymbols: TCategorizedSymbols = [];
        const first = activeSymbols[0];
        const getSubcategory = (d: TProcessedSymbolItem): TSubCategory => ({
            subcategoryId: d.submarket,
            subcategoryName: d.submarket_display_name,
            data: [],
        });
        const getCategory = (d: TProcessedSymbolItem): TCategorizedSymbolItem => ({
            categoryName: d.market_display_name,
            categoryId: d.market,
            hasSubcategory: true,
            hasSubgroup: !!(d.subgroup && d.subgroup !== 'none'),
            data: [],
            subgroups: [],
        });
        let subcategory = getSubcategory(first);
        let category = getCategory(first);
        for (const symbol of activeSymbols) {
            if (category.categoryName !== symbol.market_display_name && category.categoryName !== symbol.subgroup_display_name) {
                category.data.push(subcategory);
                categorizedSymbols.push(category);
                subcategory = getSubcategory(symbol);
                category = getCategory(symbol);
            }

            if (category.hasSubgroup) {
                if(!category.subgroups?.some((el: TCategorizedSymbolItem) => el.categoryId === symbol.subgroup)) {
                    category.subgroups?.push({
                        data: [],
                        categoryName: symbol.subgroup_display_name,
                        categoryId: symbol.subgroup,
                        hasSubcategory: true,
                        hasSubgroup: false,
                        subgroups: [],
                    });
                }
                // should push a subcategory instead of symbol
                if (!category.subgroups?.find((el: TCategorizedSymbolItem) => el.categoryId === symbol.subgroup)?.data.find((el: TSubCategory) => el.subcategoryName === symbol.submarket_display_name)) {
                    subcategory = getSubcategory(symbol);
                    category.subgroups?.find((el: TCategorizedSymbolItem) => el.categoryId === symbol.subgroup)?.data.push(subcategory);
                    subcategory = getSubcategory(symbol);
                }
                category.subgroups?.find((el: TCategorizedSymbolItem) => el.categoryId === symbol.subgroup)?.data.find((el: TSubCategory) => el.subcategoryName === symbol.submarket_display_name)?.data.push({
                    enabled: true,
                    itemId: symbol.symbol,
                    display: symbol.name,
                    dataObject: symbol,
                });
            }
            if (subcategory.subcategoryName !== symbol.submarket_display_name) {
                category.data.push(subcategory);
                subcategory = getSubcategory(symbol);
            }
            subcategory.data.push({
                enabled: true,
                itemId: symbol.symbol,
                display: symbol.name,
                dataObject: symbol,
            });
        }

        category.data.push(subcategory);
        categorizedSymbols.push(category);

        return categorizedSymbols;
    }
}
