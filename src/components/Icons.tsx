import React from 'react';
import { TIcon, TIconProps } from 'src/types';
import '../../sass/components/_icons.scss';

// Chart types:
import BaseLine from '../../sass/icons/chart settings/chart types/baseline/ic-baseline-normal.svg';
import Candle from '../../sass/icons/chart settings/chart types/candle/ic-candle-normal.svg';
import Dot from '../../sass/icons/chart settings/chart types/dot/ic-dot-normal.svg';
import LineDot from '../../sass/icons/chart settings/chart types/line dot/ic-linedot-normal.svg';
import HeikinAshi from '../../sass/icons/chart settings/chart types/ic-heikin-ashi-normal.svg';
import HollowCandle from '../../sass/icons/chart settings/chart types/hollow candle/ic-hollowcandle-normal.svg';
import Kagi from '../../sass/icons/chart settings/chart types/ic-kagi-normal.svg';
import Line from '../../sass/icons/chart settings/chart types/line/ic-line-normal.svg';
import LineBreak from '../../sass/icons/chart settings/chart types/ic-linebreak-normal.svg';
import OHLC from '../../sass/icons/chart settings/chart types/ohlc/ic-ohlc-normal.svg';
import PointFigure from '../../sass/icons/chart settings/chart types/ic-pointfigure-normal.svg';
import RangeBars from '../../sass/icons/chart settings/chart types/ic-rangebars-normal.svg';
import Renko from '../../sass/icons/chart settings/chart types/ic-renko-normal.svg';
import Spline from '../../sass/icons/chart settings/chart types/spline/ic-spline-normal.svg';
import Table from '../../sass/icons/chart settings/chart types/table/table.svg';
import Png from '../../sass/icons/download/ic-png.svg';
import Csv from '../../sass/icons/download/ic-csv.svg';

import Add from '../../sass/icons/chart settings/zoom-in/ic-zoomin-light.svg';
import AddBold from '../../sass/icons/common/ic-add.svg';
import Close from '../../sass/icons/common/ic-close.svg';
import InputNumberMinus from '../../sass/icons/common/ic-input-number-minus.svg';
import InputNumberPlus from '../../sass/icons/common/ic-input-number-plus.svg';
import CloseCircle from '../../sass/icons/close/ic-close-circle.svg';
import CloseBold from '../../sass/icons/close/ic-close-bold.svg';
import Comparison from '../../sass/icons/chart settings/comparison/ic-comparison-normal.svg';
import CrosshairOff from '../../sass/icons/chart settings/crosshair/ic-crosshair-off.svg';
import CrosshairOn from '../../sass/icons/chart settings/crosshair/ic-crosshair-on.svg';
import CrosshairTooltip from '../../sass/icons/chart settings/crosshair/ic-crosshair-tooltip.svg';
import Delete from '../../sass/icons/delete/ic-delete.svg';
import Clear from '../../sass/icons/clear/ic-clear.svg';
import Draw from '../../sass/icons/chart settings/drawing tools/ic-drawingtools-normal.svg';
import Measure from '../../sass/icons/measure/ic-measure.svg';
import Minus from '../../sass/icons/chart settings/zoom-out/ic-zoomout-light.svg';
import Star from '../../sass/icons/favorite/ic-favorite-normal.svg';
import Tick from '../../sass/icons/tick/ic-tick.svg';
import Time from '../../sass/icons/time/ic-time.svg';
import Active from '../../sass/icons/common/ic-active.svg';
import Cryptocurrency from '../../sass/icons/sidebar/cryptocurrency/ic-cryptocurrency-normal.svg';
import Commodities from '../../sass/icons/sidebar/commodities/ic-commodities-normal.svg';
import Forex from '../../sass/icons/sidebar/forex/ic-forex-normal.svg';
import BasketIndex from '../../sass/icons/sidebar/basket_index/ic-basket-normal.svg';
import BasketIndexPlaceholder from '../../sass/icons/sidebar/basket_index/ic-basket-active.svg';
import Indices from '../../sass/icons/sidebar/indices/ic-indices-normal.svg';
import Stocks from '../../sass/icons/sidebar/otc/ic-otc-normal.svg';
import SynthIndex from '../../sass/icons/sidebar/synth_index/ic-synth-normal.svg';
import Volidx from '../../sass/icons/sidebar/volatility/ic-volatility-normal.svg';
import Search from '../../sass/icons/search/ic-search-normal.svg';
import Edit from '../../sass/icons/edit/ic-edit.svg';
import Arrow from '../../sass/icons/dropdown/ic-dropdown.svg';
import PositionLeft from '../../sass/icons/chart settings/setting/ic-position-left.svg';
import PositionBottom from '../../sass/icons/chart settings/setting/ic-position-bottom.svg';
import Back from '../../sass/icons/back/ic-back.svg';
import DrawCursor from '../../sass/icons/pencil/ic-pencil.svg';
import DrawTool from '../../sass/icons/common/ic-drawing-tool.svg';

import HelpCenter from '../../sass/icons/common/ic-help-center.svg';
import Download from '../../sass/icons/common/ic-download.svg';
import Indicator from '../../sass/icons/common/ic-indicators.svg';
import Template from '../../sass/icons/common/ic-templates.svg';
import FullScreen from '../../sass/icons/common/full-screen.svg';

import Warning from '../../sass/icons/alert message/warning.svg';
import Error from '../../sass/icons/alert message/error.svg';
import Success from '../../sass/icons/alert message/success.svg';
import Info from '../../sass/icons/alert message/info.svg';

import Home from '../../sass/icons/navigation-widgets/ic-home.svg';
import Scale from '../../sass/icons/navigation-widgets/ic-scale-full.svg';
import Zoomin from '../../sass/icons/navigation-widgets/ic-zoomin.svg';
import Zoomout from '../../sass/icons/navigation-widgets/ic-zoomout.svg';

import TypeArea from '../../sass/icons/chart-type/ic-area.svg';
import TypeCandle from '../../sass/icons/chart-type/ic-candle.svg';
import TypeHollow from '../../sass/icons/chart-type/ic-hollow.svg';
import TypeOhlc from '../../sass/icons/chart-type/ic-ohlc.svg';

import TypeAreaGrayscale from '../../sass/icons/chart-type/ic-area-grayscale.svg';
import TypeCandleGrayscale from '../../sass/icons/chart-type/ic-candle-grayscale.svg';
import TypeHollowGrayscale from '../../sass/icons/chart-type/ic-hollow-grayscale.svg';
import TypeOhlcGrayscale from '../../sass/icons/chart-type/ic-ohlc-grayscale.svg';

import ArrowGreen from '../../sass/icons/arrows/ic-arrow-green.svg';
import ArrowOrange from '../../sass/icons/arrows/ic-arrow-orange.svg';

import SymbolPlaceholder from '../../sass/icons/placeholder/ic-placeholder.svg';
import AUD from '../../sass/icons/flags/aud.svg';
import CAD from '../../sass/icons/flags/cad.svg';
import CHF from '../../sass/icons/flags/chf.svg';
import EUR from '../../sass/icons/flags/eur.svg';
import GBP from '../../sass/icons/flags/gbp.svg';
import JPY from '../../sass/icons/flags/jpy.svg';
import MXN from '../../sass/icons/flags/mxn.svg';
import NOK from '../../sass/icons/flags/nok.svg';
import NZD from '../../sass/icons/flags/nzd.svg';
import PLN from '../../sass/icons/flags/pln.svg';
import SEK from '../../sass/icons/flags/sek.svg';
import USD from '../../sass/icons/flags/usd.svg';
import XAU from '../../sass/icons/flags/xau.svg';

import Russia from '../../sass/icons/flags/russia.svg';
import Arabic from '../../sass/icons/flags/arabic.svg';
import Bangladesh from '../../sass/icons/flags/bangladesh.svg';
import Srilanka from '../../sass/icons/flags/srilanka.svg';
import Mongolian from '../../sass/icons/flags/mongolian.svg';
import Kenya from '../../sass/icons/flags/kenya.svg';
import Thailand from '../../sass/icons/flags/thailand.svg';
import Turkey from '../../sass/icons/flags/turkey.svg';
import Indonesia from '../../sass/icons/flags/indonesia.svg';
import Vietnam from '../../sass/icons/flags/vietnam.svg';
import Italy from '../../sass/icons/flags/italy.svg';
import Korean from '../../sass/icons/flags/korean.svg';
import Portugal from '../../sass/icons/flags/portugal.svg';
import Chinese from '../../sass/icons/flags/chinese.svg';
import ChineseTraditional from '../../sass/icons/flags/chinese-traditional.svg';
import German from '../../sass/icons/flags/german.svg';
import HongKong from '../../sass/icons/flags/hong kong.svg';
import French from '../../sass/icons/flags/french.svg';
import Dutch from '../../sass/icons/flags/dutch.svg';
import Spanish from '../../sass/icons/flags/spanish.svg';
import WallStreet from '../../sass/icons/flags/wallstreet.svg';

/* Energy */
import OilUSD from '../../sass/icons/active-symbols/energy/oil usd/ic-oilusd.svg';
/* Metals */
import Metal from '../../sass/icons/active-symbols/metals/ic-metal.svg';

/* Synthetic Indices */
import Vol10 from '../../sass/icons/active-symbols/volatility/10 index/ic-10-index-v.svg';
import Vol25 from '../../sass/icons/active-symbols/volatility/25 index/ic-25-index-v.svg';
import Vol50 from '../../sass/icons/active-symbols/volatility/50 index/ic-50-index-v.svg';
import Vol75 from '../../sass/icons/active-symbols/volatility/75 index/ic-75-index-v.svg';
import Vol100 from '../../sass/icons/active-symbols/volatility/100 index/ic-100-index-v.svg';
import Vol1S10 from '../../sass/icons/active-symbols/volatility/1s10 index/ic-10-1s-index.svg';
import Vol1S25 from '../../sass/icons/active-symbols/volatility/1s25 index/light-25(1s)index.svg';
import Vol1S50 from '../../sass/icons/active-symbols/volatility/1s50 index/light-50(1s) index.svg';
import Vol1S75 from '../../sass/icons/active-symbols/volatility/1s75 index/light-75(1s) index.svg';
import Vol1S100 from '../../sass/icons/active-symbols/volatility/1s100 index/ic-100-1s-index.svg';
import Vol1S150 from '../../sass/icons/active-symbols/volatility/1s150 index/ic-150-1s-index.svg';
import Vol1S200 from '../../sass/icons/active-symbols/volatility/1s200 index/ic-200-1s-index.svg';
import Vol1S250 from '../../sass/icons/active-symbols/volatility/1s250 index/ic-250-1s-index.svg';
import Vol1S300 from '../../sass/icons/active-symbols/volatility/1s300 index/ic-300-1s-index.svg';
import Crash300 from '../../sass/icons/active-symbols/volatility/crash300 index/crash300 index.svg';
import Crash500 from '../../sass/icons/active-symbols/volatility/crash500 index/crash500 index.svg';
import Crash1000 from '../../sass/icons/active-symbols/volatility/crash1000 index/crash1000 index.svg';
import Boom300 from '../../sass/icons/active-symbols/volatility/boom300 index/boom300 index.svg';
import Boom500 from '../../sass/icons/active-symbols/volatility/boom500 index/boom500 index.svg';
import Boom1000 from '../../sass/icons/active-symbols/volatility/boom1000 index/boom1000 index.svg';
import MarketBear from '../../sass/icons/active-symbols/volatility/bear market/ic-marketbear.svg';
import MarketBull from '../../sass/icons/active-symbols/volatility/bull market/ic-marketbull.svg';
import Step100 from '../../sass/icons/active-symbols/volatility/step index/step-100-index.svg';
import Step200 from '../../sass/icons/active-symbols/volatility/step index/step-200-index.svg';
import Step500 from '../../sass/icons/active-symbols/volatility/step index/step-500-index.svg';
import JD10 from '../../sass/icons/active-symbols/volatility/jd10 index/ic-10-index.svg';
import JD25 from '../../sass/icons/active-symbols/volatility/jd25 index/ic-25-index.svg';
import JD50 from '../../sass/icons/active-symbols/volatility/jd50 index/ic-50-index.svg';
import JD75 from '../../sass/icons/active-symbols/volatility/jd75 index/ic-75-index.svg';
import JD100 from '../../sass/icons/active-symbols/volatility/jd100 index/ic-100-index.svg';
import JD150 from '../../sass/icons/active-symbols/volatility/jd150 index/ic-150-index.svg';
import JD200 from '../../sass/icons/active-symbols/volatility/jd200 index/ic-200-index.svg';

/* Cryptocurrency */
import BNBUSD from '../../sass/icons/active-symbols/cryptos/ic-bnbusd.svg';
import BTCLTC from '../../sass/icons/active-symbols/cryptos/ic-btcltc.svg';
import IOTUSD from '../../sass/icons/active-symbols/cryptos/ic-iotusd.svg';
import NEOUSD from '../../sass/icons/active-symbols/cryptos/ic-neousd.svg';
import OMGUSD from '../../sass/icons/active-symbols/cryptos/ic-omgusd.svg';
import TRXUSD from '../../sass/icons/active-symbols/cryptos/ic-trxusd.svg';
import XLMUSD from '../../sass/icons/active-symbols/cryptos/ic-xlmusd.svg';
import XMRUSD from '../../sass/icons/active-symbols/cryptos/ic-xmrusd.svg';
import ZECUSD from '../../sass/icons/active-symbols/cryptos/ic-zecusd.svg';
import BTCETH from '../../sass/icons/active-symbols/cryptos/ic-btceth.svg';
import DSHUSD from '../../sass/icons/active-symbols/cryptos/ic-dshusd.svg';
import ETHUSD from '../../sass/icons/active-symbols/cryptos/ic-ethusd.svg';
import BCHUSD from '../../sass/icons/active-symbols/cryptos/ic-bchusd.svg';
import LTCUSD from '../../sass/icons/active-symbols/cryptos/ic-ltcusd.svg';
import EOSUSD from '../../sass/icons/active-symbols/cryptos/ic-eosusd.svg';
import XRPUSD from '../../sass/icons/active-symbols/cryptos/ic-xrpusd.svg';
import BTCUSD from '../../sass/icons/active-symbols/cryptos/ic-btcusd.svg';

/* Stock Indices */
import USD500 from '../../sass/icons/active-symbols/stock-indices/ic-usd-500.svg';
import USTech100 from '../../sass/icons/active-symbols/stock-indices/ic-usd-tech-100.svg';
import WST30 from '../../sass/icons/active-symbols/stock-indices/ic-wallstreet-30.svg';
import UK100 from '../../sass/icons/active-symbols/stock-indices/ic-uk-100.svg';
import CHF20 from '../../sass/icons/active-symbols/stock-indices/ic-swiss-20.svg';
import DUT25 from '../../sass/icons/active-symbols/stock-indices/ic-netherland-25.svg';
import JPY225 from '../../sass/icons/active-symbols/stock-indices/ic-japan-225.svg';
import HKG50 from '../../sass/icons/active-symbols/stock-indices/ic-hong-kong-50.svg';
import DE40 from '../../sass/icons/active-symbols/stock-indices/ic-germany-40.svg';
import FR40 from '../../sass/icons/active-symbols/stock-indices/ic-france-40.svg';
import EUR50 from '../../sass/icons/active-symbols/stock-indices/ic-euro-50.svg';
import AUD200 from '../../sass/icons/active-symbols/stock-indices/ic-australian-200.svg';

import OTCBadge from '../../sass/icons/active-symbols/ic-otcbadge.svg';

import EmptyState from '../../sass/icons/shape/ic-empty-state.svg';
import OverwriteState from '../../sass/icons/shape/ic-overwrite-state.svg';
import InfoCircle from '../../sass/icons/common/ic-info.svg';

import Language from '../../sass/icons/common/ic-language.svg';
import Theme from '../../sass/icons/common/ic-theme.svg';
import Chart from '../../sass/icons/common/ic-charts.svg';
import Checkbox from '../../sass/icons/common/ic-checkbox.svg';
import CheckboxActive from '../../sass/icons/common/ic-checkbox-active.svg';

import ThemeLight from '../../sass/icons/setting/ic-theme-light.svg';
import ThemeDark from '../../sass/icons/setting/ic-theme-dark.svg';

import SettingCountdownLightNormal from '../../sass/icons/setting/countdown/ic-countdown-light-normal.svg';
import SettingCountdownLightActive from '../../sass/icons/setting/countdown/ic-countdown-light-active.svg';
import SettingCountdownDarkNormal from '../../sass/icons/setting/countdown/ic-countdown-dark-normal.svg';
import SettingCountdownDarkActive from '../../sass/icons/setting/countdown/ic-countdown-dark-active.svg';

import SettingHistoricalLightNormal from '../../sass/icons/setting/historical/ic-historical-light-normal.svg';
import SettingHistoricalLightActive from '../../sass/icons/setting/historical/ic-historical-light-active.svg';
import SettingHistoricalDarkNormal from '../../sass/icons/setting/historical/ic-historical-dark-normal.svg';
import SettingHistoricalDarkActive from '../../sass/icons/setting/historical/ic-historical-dark-active.svg';

import SettingHighestLowestLightNormal from '../../sass/icons/setting/highest-lowest/ic-highest-lowest-light-normal.svg';
import SettingHighestLowestLightActive from '../../sass/icons/setting/highest-lowest/ic-highest-lowest-light-active.svg';
import SettingHighestLowestDarkNormal from '../../sass/icons/setting/highest-lowest/ic-highest-lowest-dark-normal.svg';
import SettingHighestLowestDarkActive from '../../sass/icons/setting/highest-lowest/ic-highest-lowest-dark-active.svg';

import IndicatorCatMomentum from '../../sass/icons/indicators/ic-momentum.svg';
import IndicatorCatTrendLight from '../../sass/icons/indicators/ic-trend-light.svg';
import IndicatorCatTrendDark from '../../sass/icons/indicators/ic-trend-dark.svg';
import IndicatorCatVolatility from '../../sass/icons/indicators/ic-volatility.svg';
import IndicatorCatAverages from '../../sass/icons/indicators/ic-cat-averages.svg';
import IndicatorCatOther from '../../sass/icons/indicators/ic-other.svg';

import IndicatorAwesomeOscillator from '../../sass/icons/indicators/ic-awesome-oscillator.svg';
import IndicatorDTrended from '../../sass/icons/indicators/ic-dtrended.svg';
import IndicatorGator from '../../sass/icons/indicators/ic-gator.svg';
import IndicatorMacd from '../../sass/icons/indicators/ic-macd.svg';
import IndicatorRateChange from '../../sass/icons/indicators/ic-rate-of-change.svg';
import IndicatorRSI from '../../sass/icons/indicators/ic-rsi.svg';
import IndicatorStochasticOscillator from '../../sass/icons/indicators/ic-stochastic-oscillator.svg';
import IndicatorStochasticMomentum from '../../sass/icons/indicators/ic-stochastic-momentum.svg';
import IndicatorWilliamPercent from '../../sass/icons/indicators/ic-william-percent.svg';
import IndicatorAroon from '../../sass/icons/indicators/ic-aroon.svg';
import IndicatorAdx from '../../sass/icons/indicators/ic-adx.svg';
import IndicatorCommodityChannelIndex from '../../sass/icons/indicators/ic-commodity-channel-index.svg';
import IndicatorIchimoku from '../../sass/icons/indicators/ic-ichimoku.svg';
import IndicatorParabolic from '../../sass/icons/indicators/ic-parabolic.svg';
import IndicatorZigZag from '../../sass/icons/indicators/ic-zig-zag.svg';
import IndicatorBollinger from '../../sass/icons/indicators/ic-bollinger.svg';
import IndicatorDonchian from '../../sass/icons/indicators/ic-donchian.svg';
import IndicatorAverages from '../../sass/icons/indicators/ic-averages.svg';
import IndicatorEnvelope from '../../sass/icons/indicators/ic-envelope.svg';
import IndicatorAlligator from '../../sass/icons/indicators/ic-alligator.svg';
import IndicatorFractalChaos from '../../sass/icons/indicators/ic-fractal-chaos.svg';
import IndicatorRainbow from '../../sass/icons/indicators/ic-rainbow.svg';

import DrawToolsChannel from '../../sass/icons/draw-tools/ic-channel.svg';
import DrawToolsContinuous from '../../sass/icons/draw-tools/ic-continuous.svg';
import DrawToolsFibonaccifan from '../../sass/icons/draw-tools/ic-fibonacci-fan.svg';
import DrawToolsHorizontal from '../../sass/icons/draw-tools/ic-horizontal.svg';
import DrawToolsLine from '../../sass/icons/draw-tools/ic-line.svg';
import DrawToolsRay from '../../sass/icons/draw-tools/ic-ray.svg';
import DrawToolsRectangle from '../../sass/icons/draw-tools/ic-rectangle.svg';
import DrawToolsTrend from '../../sass/icons/draw-tools/ic-trend.svg';
import DrawToolsVertical from '../../sass/icons/draw-tools/ic-vertical.svg';

export const Wrapper = (SvgLogo: React.SVGAttributes<SVGElement>) => {
    const InnerWrapper = (props: TIconProps) => {
        let { className, 'tooltip-title': tooltip, ...p } = props; // eslint-disable-line prefer-const
        className = `ic-icon ${className || ''}`;
        const vb = SvgLogo.viewBox?.split(' ').slice(2) || [];

        return (
            <span className={className} tooltip-title={tooltip} {...p}>
                <svg width={vb[0]} height={vb[1]}>
                    <use
                        xlinkHref={__webpack_public_path__ + (SvgLogo as any).url /* eslint-disable-line no-undef */}
                    />
                </svg>
                {tooltip && (
                    <>
                        <br />
                        <span className='ic-subtitle'>{tooltip}</span>
                    </>
                )}
            </span>
        );
    };
    return InnerWrapper;
};

export const DrawingCursorIcon = Wrapper(DrawCursor);
export const ThemeLightIcon = Wrapper(ThemeLight);
export const ThemeDarkIcon = Wrapper(ThemeDark);
export const DrawToolIcon = Wrapper(DrawTool);
export const ActiveIcon = Wrapper(Active);
export const FullScreenIcon = Wrapper(FullScreen);

// Chart Types:
export const BaseLineIcon = Wrapper(BaseLine);
export const CandleIcon = Wrapper(Candle);
export const DotIcon = Wrapper(Dot);
export const LineDotIcon = Wrapper(LineDot);
export const HeikinAshiIcon = Wrapper(HeikinAshi);
export const HollowCandleIcon = Wrapper(HollowCandle);
export const KagiIcon = Wrapper(Kagi);
export const LineBreakIcon = Wrapper(LineBreak);
export const LineIcon = Wrapper(Line);
export const OHLCIcon = Wrapper(OHLC);
export const PointFigureIcon = Wrapper(PointFigure);
export const RangeBarsIcon = Wrapper(RangeBars);
export const RenkoIcon = Wrapper(Renko);
export const TableIcon = Wrapper(Table);
export const AddIcon = Wrapper(AddBold);
export const ZoomInIcon = Wrapper(Add);
export const CloseIcon = Wrapper(Close);
export const InputNumberMinusIcon = Wrapper(InputNumberMinus);
export const InputNumberPlusIcon = Wrapper(InputNumberPlus);
export const CloseCircleIcon = Wrapper(CloseCircle);
export const CloseBoldIcon = Wrapper(CloseBold);
export const ComparisonIcon = Wrapper(Comparison);
export const CrosshairOffIcon = Wrapper(CrosshairOff);
export const CrosshairOnIcon = Wrapper(CrosshairOn);
export const CrosshairTooltipIcon = Wrapper(CrosshairTooltip);
export const DeleteIcon = Wrapper(Delete);
export const ClearIcon = Wrapper(Clear);
export const DrawIcon = Wrapper(Draw);
export const IndicatorIcon = Wrapper(Indicator);
export const MeasureIcon = Wrapper(Measure);
export const ZoomOutIcon = Wrapper(Minus);
export const SplineIcon = Wrapper(Spline);
export const PngIcon = Wrapper(Png);
export const CsvIcon = Wrapper(Csv);
export const StarIcon = Wrapper(Star);
export const TemplateIcon = Wrapper(Template);
export const TickIcon = Wrapper(Tick);
export const TimeIcon = Wrapper(Time);
export const SearchIcon = Wrapper(Search);
export const EditIcon = Wrapper(Edit);
export const SettingIcon = Wrapper(Edit);
export const ArrowIcon = Wrapper(Arrow);
export const FavoriteIcon = Wrapper(Star);
export const HelpCenterIcon = Wrapper(HelpCenter);
export const DownloadIcon = Wrapper(Download);
export const InfoIcon = Wrapper(Info);
export const InfoCircleIcon = Wrapper(InfoCircle);

export const PositionLeftIcon = Wrapper(PositionLeft);
export const PositionBottomIcon = Wrapper(PositionBottom);
export const BackIcon = Wrapper(Back);

export const HomeIcon = Wrapper(Home);
export const ScaleIcon = Wrapper(Scale);
export const ZoominIcon = Wrapper(Zoomin);
export const ZoomoutIcon = Wrapper(Zoomout);

export const LanguageIcon = Wrapper(Language);
export const ThemeIcon = Wrapper(Theme);
export const ChartIcon = Wrapper(Chart);
export const CheckboxIcon = Wrapper(Checkbox);
export const CheckboxActiveIcon = Wrapper(CheckboxActive);

export const TypeAreaIcon = Wrapper(TypeArea);
export const TypeCandleIcon = Wrapper(TypeCandle);
export const TypeHollowIcon = Wrapper(TypeHollow);
export const TypeOhlcIcon = Wrapper(TypeOhlc);

export const TypeAreaGrayscaleIcon = Wrapper(TypeAreaGrayscale);
export const TypeCandleGrayscaleIcon = Wrapper(TypeCandleGrayscale);
export const TypeHollowGrayscaleIcon = Wrapper(TypeHollowGrayscale);
export const TypeOhlcGrayscaleIcon = Wrapper(TypeOhlcGrayscale);

export const IndicatorCatMomentumIcon = Wrapper(IndicatorCatMomentum);
export const IndicatorCatTrendLightIcon = Wrapper(IndicatorCatTrendLight);
export const IndicatorCatTrendDarkIcon = Wrapper(IndicatorCatTrendDark);
export const IndicatorCatVolatilityIcon = Wrapper(IndicatorCatVolatility);
export const IndicatorCatAveragesIcon = Wrapper(IndicatorCatAverages);
export const IndicatorCatOtherIcon = Wrapper(IndicatorCatOther);

export const IndicatorAwesomeOscillatorIcon = Wrapper(IndicatorAwesomeOscillator);
export const IndicatorDTrendedIcon = Wrapper(IndicatorDTrended);
export const IndicatorGatorIcon = Wrapper(IndicatorGator);
export const IndicatorMacdIcon = Wrapper(IndicatorMacd);
export const IndicatorRateChangeIcon = Wrapper(IndicatorRateChange);
export const IndicatorRSIIcon = Wrapper(IndicatorRSI);
export const IndicatorStochasticOscillatorIcon = Wrapper(IndicatorStochasticOscillator);
export const IndicatorStochasticMomentumIcon = Wrapper(IndicatorStochasticMomentum);
export const IndicatorWilliamPercentIcon = Wrapper(IndicatorWilliamPercent);
export const IndicatorAroonIcon = Wrapper(IndicatorAroon);
export const IndicatorAdxIcon = Wrapper(IndicatorAdx);
export const IndicatorCommodityChannelIndexIcon = Wrapper(IndicatorCommodityChannelIndex);
export const IndicatorIchimokuIcon = Wrapper(IndicatorIchimoku);
export const IndicatorParabolicIcon = Wrapper(IndicatorParabolic);
export const IndicatorZigZagIcon = Wrapper(IndicatorZigZag);
export const IndicatorBollingerIcon = Wrapper(IndicatorBollinger);
export const IndicatorDonchianIcon = Wrapper(IndicatorDonchian);
export const IndicatorAveragesIcon = Wrapper(IndicatorAverages);
export const IndicatorEnvelopeIcon = Wrapper(IndicatorEnvelope);
export const IndicatorAlligatorIcon = Wrapper(IndicatorAlligator);
export const IndicatorFractalChaosIcon = Wrapper(IndicatorFractalChaos);
export const IndicatorRainbowIcon = Wrapper(IndicatorRainbow);

export const MetalIcon = Wrapper(Metal);
export const EmptyStateIcon = Wrapper(EmptyState);
export const OverwriteStateIcon = Wrapper(OverwriteState);

export const ArrowGreenIcon = Wrapper(ArrowGreen);
export const ArrowOrangeIcon = Wrapper(ArrowOrange);

export const DrawToolsChannelIcon = Wrapper(DrawToolsChannel);
export const DrawToolsContinuousIcon = Wrapper(DrawToolsContinuous);
export const DrawToolsFibonaccifanIcon = Wrapper(DrawToolsFibonaccifan);

export const DrawToolsHorizontalIcon = Wrapper(DrawToolsHorizontal);
export const DrawToolsLineIcon = Wrapper(DrawToolsLine);
export const DrawToolsRayIcon = Wrapper(DrawToolsRay);
export const DrawToolsRectangleIcon = Wrapper(DrawToolsRectangle);
export const DrawToolsTrendIcon = Wrapper(DrawToolsTrend);
export const DrawToolsVerticalIcon = Wrapper(DrawToolsVertical);

export const alertIconMap = {
    info: Wrapper(Info),
    success: Wrapper(Success),
    warning: Wrapper(Warning),
    error: Wrapper(Error),
};

export const SymbolPlaceholderIcon = Wrapper(SymbolPlaceholder);

export const CategoryIconMap = {
    active: Wrapper(Active),
    commodities: Wrapper(Commodities),
    cryptocurrency: Wrapper(Cryptocurrency),
    favorite: Wrapper(Star),
    forex: Wrapper(Forex),
    basket_index: Wrapper(BasketIndex),
    indices: Wrapper(Indices),
    stocks: Wrapper(Stocks),
    volidx: Wrapper(Volidx),
    synthetic_index: Wrapper(SynthIndex),
    indicators: Wrapper(Indicator),
};

export const SettingCountdownMap = {
    light: {
        normal: Wrapper(SettingCountdownLightNormal),
        active: Wrapper(SettingCountdownLightActive),
    },
    dark: {
        normal: Wrapper(SettingCountdownDarkNormal),
        active: Wrapper(SettingCountdownDarkActive),
    },
};

export const SettingHistoricalMap = {
    light: {
        normal: Wrapper(SettingHistoricalLightNormal),
        active: Wrapper(SettingHistoricalLightActive),
    },
    dark: {
        normal: Wrapper(SettingHistoricalDarkNormal),
        active: Wrapper(SettingHistoricalDarkActive),
    },
};

export const SettingHighestLowestMap = {
    light: {
        normal: Wrapper(SettingHighestLowestLightNormal),
        active: Wrapper(SettingHighestLowestLightActive),
    },
    dark: {
        normal: Wrapper(SettingHighestLowestDarkNormal),
        active: Wrapper(SettingHighestLowestDarkActive),
    },
};

const FlagIconMap = {
    AUD: Wrapper(AUD),
    CAD: Wrapper(CAD),
    CHF: Wrapper(CHF),
    EUR: Wrapper(EUR),
    GBP: Wrapper(GBP),
    JPY: Wrapper(JPY),
    MXN: Wrapper(MXN),
    NOK: Wrapper(NOK),
    NZD: Wrapper(NZD),
    PLN: Wrapper(PLN),
    SEK: Wrapper(SEK),
    USD: Wrapper(USD),
    XAU: Wrapper(XAU),
    HongKong: Wrapper(HongKong),
    Dutch: Wrapper(Dutch),
    German: Wrapper(German),
    French: Wrapper(French),
    Spanish: Wrapper(Spanish),
    WallStreet: Wrapper(WallStreet),
};

export const FlagIcons = {
    USD: Wrapper(USD),
    GBP: Wrapper(GBP),
    German: Wrapper(German),
    French: Wrapper(French),
    Russia: Wrapper(Russia),
    Arabic: Wrapper(Arabic),
    Bangladesh: Wrapper(Bangladesh),
    Srilanka: Wrapper(Srilanka),
    Mongolian: Wrapper(Mongolian),
    Kenya: Wrapper(Kenya),
    Thailand: Wrapper(Thailand),
    Turkey: Wrapper(Turkey),
    Indonesia: Wrapper(Indonesia),
    Vietnam: Wrapper(Vietnam),
    Italy: Wrapper(Italy),
    Korean: Wrapper(Korean),
    Portugal: Wrapper(Portugal),
    Chinese: Wrapper(Chinese),
    ChineseTraditional: Wrapper(ChineseTraditional),
    Poland: Wrapper(PLN),
    Spanish: Wrapper(Spanish),
};

export const ItemIconMap = {
    SPC: FlagIconMap.USD,
    AS51: FlagIconMap.AUD,
    HSI: FlagIconMap.HongKong,
    N225: FlagIconMap.JPY,
    AEX: FlagIconMap.Dutch,
    FCHI: FlagIconMap.French,
    SSMI: FlagIconMap.CHF,
    GDAXI: FlagIconMap.German,
    /* Commodities */
    frxBROUSD: Wrapper(OilUSD),
    frxXAUUSD: MetalIcon,
    frxXPDUSD: MetalIcon,
    frxXPTUSD: MetalIcon,
    frxXAGUSD: MetalIcon,
    /* Volatility Indices */
    R_10: Wrapper(Vol10),
    R_25: Wrapper(Vol25),
    R_50: Wrapper(Vol50),
    R_75: Wrapper(Vol75),
    R_100: Wrapper(Vol100),
    '1HZ10V': Wrapper(Vol1S10),
    '1HZ25V': Wrapper(Vol1S25),
    '1HZ50V': Wrapper(Vol1S50),
    '1HZ75V': Wrapper(Vol1S75),
    '1HZ100V': Wrapper(Vol1S100),
    '1HZ150V': Wrapper(Vol1S150),
    '1HZ200V': Wrapper(Vol1S200),
    '1HZ250V': Wrapper(Vol1S250),
    '1HZ300V': Wrapper(Vol1S300),
    BOOM300N: Wrapper(Boom300),
    BOOM500: Wrapper(Boom500),
    BOOM1000: Wrapper(Boom1000),
    CRASH300N: Wrapper(Crash300),
    CRASH500: Wrapper(Crash500),
    CRASH1000: Wrapper(Crash1000),
    RDBEAR: Wrapper(MarketBear),
    RDBULL: Wrapper(MarketBull),
    stpRNG: Wrapper(Step100),
    stpRNG2: Wrapper(Step200),
    stpRNG5: Wrapper(Step500),
    JD10: Wrapper(JD10),
    JD25: Wrapper(JD25),
    JD50: Wrapper(JD50),
    JD75: Wrapper(JD75),
    JD100: Wrapper(JD100),
    JD150: Wrapper(JD150),
    JD200: Wrapper(JD200),
    /* Cryptocurrency Indices */
    cryBNBUSD: Wrapper(BNBUSD),
    cryBTCLTC: Wrapper(BTCLTC),
    cryIOTUSD: Wrapper(IOTUSD),
    cryNEOUSD: Wrapper(NEOUSD),
    cryOMGUSD: Wrapper(OMGUSD),
    cryTRXUSD: Wrapper(TRXUSD),
    cryBTCETH: Wrapper(BTCETH),
    cryZECUSD: Wrapper(ZECUSD),
    cryXMRUSD: Wrapper(XMRUSD),
    cryXLMUSD: Wrapper(XLMUSD),
    cryDSHUSD: Wrapper(DSHUSD),
    cryETHUSD: Wrapper(ETHUSD),
    cryBCHUSD: Wrapper(BCHUSD),
    cryLTCUSD: Wrapper(LTCUSD),
    cryEOSUSD: Wrapper(EOSUSD),
    cryXRPUSD: Wrapper(XRPUSD),
    cryBTCUSD: Wrapper(BTCUSD),
    /* Stock Indices */
    OTC_AEX: Wrapper(DUT25),
    OTC_FTSE: Wrapper(UK100),
    OTC_SX5E: Wrapper(EUR50),
    OTC_FCHI: Wrapper(FR40),
    OTC_GDAXI: Wrapper(DE40),
    OTC_N225: Wrapper(JPY225),
    OTC_SPC: Wrapper(USD500),
    OTC_DJI: Wrapper(WST30),
    OTC_NDX: Wrapper(USTech100),
    OTC_SSMI: Wrapper(CHF20),
    OTC_HSI: Wrapper(HKG50),
    OTC_AS51: Wrapper(AUD200),
};

const createCompositeIcon = (A: TIcon, B: TIcon, icId: string) => {
    const FC = (props: { className?: string }) => {
        const { className, ...p } = props;
        return (
            <span className={`${icId} ${className}`} {...p}>
                <A />
                <B />
            </span>
        );
    };

    return FC;
};

function frx(flagA: keyof typeof FlagIconMap, flagB: keyof typeof FlagIconMap) {
    const A = FlagIconMap[flagA];
    const B = FlagIconMap[flagB];
    ItemIconMap[`frx${flagA}${flagB}` as keyof typeof ItemIconMap] = createCompositeIcon(A, B, 'ic-frx');
}

export const OTCBadgeIcon = Wrapper(OTCBadge);
const BasketIndexIcon = Wrapper(BasketIndexPlaceholder);

function wld(flag: keyof typeof FlagIconMap) {
    const FlagIcon = FlagIconMap[flag];
    ItemIconMap[`WLD${flag}` as keyof typeof ItemIconMap] = createCompositeIcon(BasketIndexIcon, FlagIcon, 'ic-wld');
}

/* Basket Indices */
/* Forex Basket */
wld('AUD');
wld('EUR');
wld('GBP');
wld('USD');
/* Commodities Basket */
wld('XAU');

/* FOREX */
/* Major Pairs */
frx('AUD', 'JPY');
frx('AUD', 'USD');
frx('EUR', 'AUD');
frx('EUR', 'CHF');
frx('EUR', 'JPY');
frx('EUR', 'CAD');
frx('EUR', 'GBP');
frx('EUR', 'USD');
frx('GBP', 'AUD');
frx('GBP', 'JPY');
frx('GBP', 'USD');
frx('USD', 'CAD');
frx('USD', 'CHF');
frx('USD', 'JPY');
/* Minor Pairs */
frx('AUD', 'CAD');
frx('AUD', 'CHF');
frx('AUD', 'NZD');
frx('AUD', 'PLN');
frx('EUR', 'NZD');
frx('GBP', 'CAD');
frx('GBP', 'CHF');
frx('GBP', 'NOK');
frx('GBP', 'NZD');
frx('GBP', 'PLN');
frx('NZD', 'JPY');
frx('NZD', 'USD');
frx('USD', 'MXN');
frx('USD', 'NOK');
frx('USD', 'PLN');
frx('USD', 'SEK');

export const ActiveOptionsIconMap = {
    delete: DeleteIcon,
    edit: EditIcon,
};
