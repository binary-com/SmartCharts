import EventEmitter from 'event-emitter-es6';
import NotificationStore from '../store/NotificationStore';
import { TickHistoryFormatter } from './TickHistoryFormatter';
import PendingPromise from '../utils/PendingPromise';
import { getUTCEpoch } from '../utils';

class Feed {
    static get EVENT_MASTER_DATA_UPDATE() { return 'EVENT_MASTER_DATA_UPDATE'; }
    static get EVENT_COMPARISON_DATA_UPDATE() { return 'EVENT_COMPARISON_DATA_UPDATE'; }

    constructor(binaryApi, cxx, mainStore) {
        this._cxx = cxx;
        this._binaryApi = binaryApi;
        this._callbacks = {};
        this._mainStore = mainStore;
        this._emitter = new EventEmitter({ emitDelay: 0 });
    }

    // although not used, subscribe is overridden so that unsubscribe will be called by ChartIQ
    subscribe() {}

    // Do not call explicitly! Method below is called by ChartIQ when unsubscribing symbols.
    unsubscribe(params) {
        const key = this._getStreamKey(params);
        if (this._callbacks[key]) {
            const { symbolObject, period, interval } = params;
            this._binaryApi.forget({
                symbol: symbolObject.symbol,
                granularity: Feed.calculateGranularity(period, interval),
            }, this._callbacks[key]);
            delete this._callbacks[key];
        }
    }

    _getStreamKey({ symbol, period, interval }) {
        return JSON.stringify({ symbol, period, interval });
    }

    async fetchInitialData(symbol, suggestedStartDate, suggestedEndDate, params, callback) {
        const { period, interval, symbolObject } = params;
        const key = this._getStreamKey(params);
        const isComparisonChart = this._cxx.chart.symbol !== symbol;
        const comparisonChartSymbol = isComparisonChart ? symbol : undefined;

        const dataRequest = {
            symbol,
            granularity: Feed.calculateGranularity(period, interval),
        };

        const tickHistoryPromise = new PendingPromise();
        let hasHistory = false;
        const processTick = (resp) => {
            if (this._cxx.isDestroyed) {
                console.error('No data should be coming in when chart is destroyed!');
                return;
            }
            // We assume that 1st response is the history, and subsequent
            // responses are tick stream data.
            if (hasHistory) {
                const quotes = [TickHistoryFormatter.formatTick(resp)];

                if (comparisonChartSymbol) {
                    this._cxx.updateChartData(quotes, null, {
                        useAsLastSale: true,
                        secondarySeries: comparisonChartSymbol,
                    });
                    this._emitter.emit(Feed.EVENT_COMPARISON_DATA_UPDATE);
                } else {
                    this._cxx.updateChartData(quotes);
                    this._emitter.emit(Feed.EVENT_MASTER_DATA_UPDATE, quotes[0]);
                }
                return;
            }
            tickHistoryPromise.resolve(resp);
            hasHistory = true;
        };
        this._binaryApi.subscribeTickHistory(dataRequest, processTick);
        let response = await tickHistoryPromise;

        // Clear all notifications related to active symbols
        this._mainStore.notification.removeByCategory('activesymbol');

        if (response.error) {
            const errorCode = response.error.code;
            const tParams = { symbol: symbolObject.name };
            if (/^(MarketIsClosed|NoRealtimeQuotes)$/.test(errorCode)) {
                // Although market is closed, we display the past tick history data
                response = await this._binaryApi.getTickHistory(dataRequest);
                this._mainStore.notification.notify({
                    text: t.translate('[symbol] market is presently closed.', tParams),
                    category: 'activesymbol',
                });
            } else if (errorCode === 'StreamingNotAllowed') {
                this._mainStore.notification.notify({
                    text: t.translate('Streaming for [symbol] is not available due to license restrictions', tParams),
                    type: NotificationStore.TYPE_ERROR,
                    category: 'activesymbol',
                });
                let dataCallback = { quotes: [] };
                if (isComparisonChart) {
                    // Passing error will prevent the chart from being shown; for
                    // main chart we still want the chart to be shown, just disabled
                    dataCallback = { error: errorCode, suppressAlert: true, ...dataCallback };
                } else {
                    this._mainStore.chart.setChartAvailability(false);
                }
                callback(dataCallback);
                return;
            }
        } else {
            this._callbacks[key] = processTick;
        }

        const quotes = TickHistoryFormatter.formatHistory(response);
        if (!quotes) {
            console.error('Unexpected response: ', response);
            return;
        }

        callback({ quotes });
        if (!isComparisonChart) {
            this._emitter.emit(Feed.EVENT_MASTER_DATA_UPDATE, {
                ...quotes[quotes.length - 1],
                prevClose: quotes[quotes.length - 2].Close,
            });
            this._mainStore.chart.setChartAvailability(true);
        } else {
            this._emitter.emit(Feed.EVENT_COMPARISON_DATA_UPDATE);
        }
    }

    async fetchPaginationData(symbol, suggestedStartDate, endDate, params, callback) {
        const start = getUTCEpoch(suggestedStartDate);
        const end   = getUTCEpoch(endDate);
        const now   = getUTCEpoch(new Date());
        const startLimit = now - (2.8 * 365 * 24 * 60 * 60);
        const { period, interval } = params;

        const result = { quotes: [] };
        if (end > startLimit) {
            try {
                const response = await this._binaryApi.getTickHistory({
                    symbol,
                    granularity: Feed.calculateGranularity(period, interval),
                    start: Math.max(start, startLimit),
                    end,
                });
                result.quotes = TickHistoryFormatter.formatHistory(response);
            } catch (err) {
                console.error(err);
                result.quotes = { error: err };
            }
        }

        callback(result);
    }

    unsubscribeAll() {
        for (const key in this._callbacks) {
            const { symbol, period, interval } = JSON.parse(key);
            this._binaryApi.forget({
                symbol,
                granularity: Feed.calculateGranularity(period, interval),
            }, this._callbacks[key]);
        }
    }

    static calculateGranularity(period, interval) {
        const toSeconds = {
            second: 0,
            minute: 60,
            day: 24 * 60 * 60,
        };

        return toSeconds[interval] * period;
    }

    onMasterDataUpdate(callback) {
        this._emitter.on(Feed.EVENT_MASTER_DATA_UPDATE, callback);
    }

    onComparisonDataUpdate(callback) {
        this._emitter.on(Feed.EVENT_COMPARISON_DATA_UPDATE, callback);
    }
}


export default Feed;
