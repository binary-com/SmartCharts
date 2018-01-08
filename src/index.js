import $ from 'jquery';
import { CIQ, $$$ } from '../js/chartiq';

import StreamManager from './stream-manager';
import Feed from './feed';

// Before using components, you need to first import components/ui
import './components/Lookup';
import './components/Menu';
import Context from './components/ui/Context';
import KeystrokeHub from './components/ui/KeystrokeHub';

import TFC from '../plugins/tfc/tfc';

window.CIQ = CIQ;

const _streamManager = StreamManager.buildFor({
    appId: 1,
    language: 'en',
    endpoint: 'wss://frontend.binaryws.com/websockets/v3',
});

const stxx = new CIQ.ChartEngine({
    container: $$$('#chartContainer'),
});

// connect chart to data
// stxx.attachQuoteFeed(quotefeedSimulator,{refreshInterval:1});
stxx.attachQuoteFeed(new Feed(_streamManager, stxx), {
    refreshInterval: null,
});

// used to restore layout on startup
function restoreLayout(stx, cb) {
    const datum = CIQ.localStorage.getItem('myChartLayout');
    if (datum === null) return;
    stx.importLayout(JSON.parse(datum), {
        managePeriodicity: true,
        cb,
    });
}

// save the chart's layout when the symbol or layout changes
function saveLayout(obj) {
    const s = JSON.stringify(obj.stx.exportLayout(true));
    CIQ.localStorageSetItem('myChartLayout', s);
}
stxx.callbacks.layout = saveLayout;
stxx.callbacks.symbolChange = saveLayout;

function startUI() {
    const UIContext = new Context(stxx, $('*[cq-context]'));

    UIContext.changeSymbol = function (data) {
        let stx = this.stx;
        if (this.loader) this.loader.show();
        data.symbol = data.symbol.toUpperCase(); // set a pretty display version

        let self = this;
        stx.newChart(data, null, null, () => {
            if (self.loader) self.loader.hide();
        });
    };

    // eslint-disable-next-line no-unused-vars
    let keyhub = new KeystrokeHub($('body'), UIContext, {
        cb: KeystrokeHub.defaultHotKeys,
    });

    if (UIContext.loader) UIContext.loader.show();
    restoreLayout(stxx, () => {
        if (UIContext.loader) UIContext.loader.hide();
    });

    if (!stxx.chart.symbol) {
        UIContext.UISymbolLookup.selectItem({
            symbol: 'R_100',
        }); // load an initial symbol
    }

    let tfcConfig = { stx: stxx };
    stxx.tfc = new TFC(tfcConfig);

    window.stxx = stxx; // stxx.tfc.newTrade('enableStraddle') // 'enableShort'
}

function resizeScreen() {
    $('#chartContainer').css('height', `${$('.ciq-chart').height()}px`);
    stxx.resizeChart();
}

window.addEventListener('WebComponentsReady', () => {
    startUI();
    resizeScreen();
});

$(window).resize(resizeScreen);
