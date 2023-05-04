import {
    TicksHistoryResponse,
    TicksStreamResponse,
    AuditDetailsForExpiredContract,
    ProposalOpenContract,
} from '@deriv/api-types';
import { OHLCStreamResponse, TQuote } from 'src/types';
import { getUTCDate } from '../utils';

export class TickHistoryFormatter {
    static formatHistory(response: TicksHistoryResponse): TQuote[] | undefined {
        const { history, candles } = response;
        if (history) {
            const { times = [], prices = [] } = history;
            const quotes = prices.map((p, idx) => ({
                Date: getUTCDate(+times[idx]),
                Close: +p,
            }));
            return quotes;
        }

        if (candles) {
            const quotes: TQuote[] = candles.map(c => {
                const candle = c as Required<typeof c>;
                return {
                    Date: getUTCDate(+candle.epoch),
                    Open: +candle.open,
                    High: +candle.high,
                    Low: +candle.low,
                    Close: +candle.close,
                };
            });
            return quotes;
        }
        return undefined;
    }

    static formatTick(response: TicksStreamResponse | OHLCStreamResponse): TQuote | undefined {
        if ('tick' in response) {
            const { tick } = response as Required<typeof response>;
            const t = tick as Required<typeof tick>;
            return {
                Date: getUTCDate(+t.epoch),
                Close: +t.quote,
                // Keep the origial value.
                // It'll be used to pass down to deriv.app in BottomWidgets.
                // TODO: use tick.epoch in RawMarker to speed up calculations.
                tick,
            };
        }

        if ('ohlc' in response) {
            const { ohlc } = response as OHLCStreamResponse;
            return {
                Date: getUTCDate(+ohlc.open_time),
                Open: +ohlc.open,
                High: +ohlc.high,
                Low: +ohlc.low,
                Close: +ohlc.close,
                ohlc,
            };
        }

        return undefined;
    }
    static formatAllTicks(
        allTicksContract: NonNullable<NonNullable<AuditDetailsForExpiredContract>['all_ticks']>
    ): TQuote[] | undefined {
        return allTicksContract?.map(res => ({
            Date: getUTCDate(+(res.epoch || 0)),
            Close: +(res.tick || 0),
        }));
    }
    static formatPOCTick(contract_info: ProposalOpenContract) {
        const { tick_stream = [], underlying = '' } = contract_info || {};
        if (tick_stream.length && underlying) {
            return tick_stream.map(({ epoch = 0, tick, tick_display_value }) => ({
                Date: getUTCDate(epoch),
                Close: tick || 0,
                tick: {
                    epoch,
                    quote: tick || 0,
                    symbol: underlying,
                    pip_size: tick_display_value?.split('.')[1]?.length || 0,
                },
            }));
        }
        return null;
    }
}
