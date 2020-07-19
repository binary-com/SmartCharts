import { // eslint-disable-line import/no-extraneous-dependencies,import/no-unresolved
    SmartChart,
    StudyLegend,
    Views,
    ChartMode,
    DrawTools,
    ChartSetting,
    createObjectFromLocalStorage,
    setSmartChartsPublicPath,
    Share,
    ChartTitle,
    logEvent,
    LogCategories,
    LogActions,
    Marker,
    ToolbarWidget,
} from '@binary-com/smartcharts'; // eslint-disable-line import/no-unresolved
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import 'url-search-params-polyfill';
import { configure } from 'mobx';
import './app.scss';
import whyDidYouRender  from '@welldone-software/why-did-you-render';
import { ConnectionManager, StreamManager } from './connection';
import Notification from './Notification.jsx';
import ChartNotifier from './ChartNotifier.js';
import ChartHistory from './ChartHistory.jsx';
import NetworkMonitor from './connection/NetworkMonitor';

setSmartChartsPublicPath('./dist/');

const isMobile = window.navigator.userAgent.toLowerCase().includes('mobi');

if (process.env.NODE_ENV !== 'production') {
    whyDidYouRender(React, {
        collapseGroups: true,
        include: [/.*/],
        exclude: [/^RenderInsideChart$/, /^inject-/],
    });
}

const trackJSDomains = ['binary.com', 'binary.me'];
window.isProductionWebsite = trackJSDomains.reduce((acc, val) => (acc || window.location.host.endsWith(val)), false);

if (window.isProductionWebsite) {
    window._trackJs = { token: '346262e7ffef497d85874322fff3bbf8', application: 'smartcharts' };
    const s = document.createElement('script');
    s.src = 'https://cdn.trackjs.com/releases/current/tracker.js';
    document.body.appendChild(s);
}

/* // PWA support is temporarily removed until its issues can be sorted out
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(`${window.location.origin + window.location.pathname}sw.js`)
        .then(() => {
            console.log('Service Worker Registered');
        }).catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
        });
}
*/

configure({ enforceActions: 'observed' });

function getLanguageStorage() {
    const default_language = 'en';
    try {
        const setting_string = localStorage.getItem('smartchart-setting'),
            setting = JSON.parse(setting_string !== '' ? setting_string : '{}');

        return setting.language || default_language;
    } catch (e) {
        return default_language;
    }
}

function getServerUrl() {
    const local = localStorage.getItem('config.server_url');
    return `wss://${local || 'frontend.binaryws.com'}/websockets/v3`;
}

const chartId = '1';
const appId  = localStorage.getItem('config.app_id') || 12812;
const serverUrl = getServerUrl();
const language = new URLSearchParams(window.location.search).get('l') || getLanguageStorage();
const today = moment().format('YYYY/MM/DD 00:00');
const connectionManager = new ConnectionManager({
    appId,
    language,
    endpoint: serverUrl,
});
const ActiveMarkets = ['forex', 'indices', 'stocks', 'commodities', 'synthetic_index'];
const IntervalEnum = {
    second: 1,
    minute: 60,
    hour: 3600,
    day: 24 * 3600,
    year: 365 * 24 * 3600,
};
const activeLanguages = ['EN', 'DE', 'ES', 'FR', 'ID',
    'IT', 'PL', 'PT', 'RU', 'TH',
    'VI', 'ZH_CN', 'ZH_TW',
];

const streamManager = new StreamManager(connectionManager);
const requestAPI = connectionManager.send.bind(connectionManager);
const requestSubscribe = streamManager.subscribe.bind(streamManager);
const requestForget = streamManager.forget.bind(streamManager);

class App extends Component {
    startingLanguage = 'en';

    constructor(props) {
        super(props);
        this.notifier = new ChartNotifier();
        const layoutString = localStorage.getItem(`layout-${chartId}`),
            layout = JSON.parse(layoutString !== '' ? layoutString : '{}');
        let chartType;
        let granularity;
        let endEpoch;
        let settings = createObjectFromLocalStorage('smartchart-setting');

        if (settings) {
            settings.language = language;
            this.startingLanguage = settings.language;
        } else {
            settings = { language };
        }

        settings.activeLanguages = activeLanguages;
        if (settings.historical) {
            this.removeAllComparisons();
            endEpoch = (new Date(`${today}:00Z`).valueOf() / 1000);
            chartType = 'mountain';
            granularity = 0;
            if (layout) {
                granularity = layout.timeUnit === 'second' ? 0 : parseInt(layout.interval * IntervalEnum[layout.timeUnit], 10); // eslint-disable-line

                if (layout.chartType === 'candle' && layout.aggregationType !== 'ohlc') {
                    chartType = layout.aggregationType;
                } else {
                    chartType = layout.chartType;
                }
            }
        }
        settings.isHighestLowestMarkerEnabled = false;

        connectionManager.on(
            ConnectionManager.EVENT_CONNECTION_CLOSE,
            () => this.setState({ isConnectionOpened: false }),
        );
        connectionManager.on(
            ConnectionManager.EVENT_CONNECTION_REOPEN,
            () => this.setState({ isConnectionOpened: true }),
        );

        this.state = {
            settings,
            endEpoch,
            chartType,
            granularity,
            isConnectionOpened: true,
        };
    }

    componentDidMount() {
        const networkMonitor = NetworkMonitor.getInstance();
        networkMonitor.init(requestAPI, this.handleNetworkStatus);
    }

    /*
    shouldComponentUpdate(nextProps, nextState) {
        return this.state.symbol !== nextState.symbol
            || JSON.stringify(this.state.settings) !== JSON.stringify(nextState.settings);
    }
    */
    removeAllComparisons = () => {
        try {
            const layoutString = localStorage.getItem(`layout-${chartId}`),
                layout = JSON.parse(layoutString !== '' ? layoutString : '{}');

            layout.symbols.splice(1, layout.symbols.length - 1);
            localStorage.setItem(`layout-${chartId}`, JSON.stringify(layout));
        } catch (e) {
            console.log(e);
        }
    }

    handleNetworkStatus = status => this.setState({ networkStatus: status });

    symbolChange = (symbol) => {
        logEvent(LogCategories.ChartTitle, LogActions.MarketSelector, symbol);
        this.notifier.removeByCategory('activesymbol');
        this.setState({ symbol });
    };

    saveSettings = (settings) => {
        const prevSetting = this.state.settings;
        console.log('settings updated:', settings);
        localStorage.setItem('smartchart-setting', JSON.stringify(settings));


        if (!prevSetting.historical && settings.historical) {
            this.setState({
                chartType: 'mountain',
                granularity: 0,
                endEpoch: (new Date(`${today}:00Z`).valueOf() / 1000),
            });
            this.removeAllComparisons();
        } else if (!settings.historical) {
            this.handleDateChange('');
        }

        this.setState({ settings });
        if (this.startingLanguage !== settings.language) {
            // Place language in URL:
            const { origin, search, pathname } = window.location;
            const url = new URLSearchParams(search);
            url.delete('l');
            url.set('l', settings.language);
            window.location.href = `${origin}${pathname}?${url.toString()}`;
        }
    };

    handleDateChange = (value) => {
        this.setState({ endEpoch: (value !== '') ? (new Date(`${value}:00Z`).valueOf() / 1000) : undefined });
    };
    changeGranularity = timePeriod => this.setState({ granularity: timePeriod });
    changeChartType = chartType => this.setState({ chartType });

    renderTopWidgets = () => (
        <>
            <ChartTitle onChange={this.symbolChange} isNestedList={isMobile} />
            {this.state.settings.historical ? <ChartHistory onChange={this.handleDateChange} /> : ''}
            <Notification
                notifier={this.notifier}
            />
        </>
    );

    renderControls = () => (
        <>
            <ChartSetting />
        </>
    );

    renderToolbarWidget = () => (
        <ToolbarWidget>
            <ChartMode
                onChartType={this.changeChartType}
                onGranularity={this.changeGranularity}
            />
            <StudyLegend />
            <Views />
            <DrawTools />
            <Share />
        </ToolbarWidget>
    );

    onMessage = (e) => {
        this.notifier.notify(e);
    };

    getIsChartReady = isChartReady => isChartReady;

    onMarkerRef = (ref) => {
        if (ref) {
            ref.setPosition({
                epoch: this.state.endEpoch,
            });
        }
    };

    render() {
        const { settings, isConnectionOpened, symbol, endEpoch, networkStatus } = this.state;

        return (
            <SmartChart
                id={chartId}
                chartStatusListener={isChartReady => this.getIsChartReady(isChartReady)}
                symbol={symbol}
                isMobile={isMobile}
                onMessage={this.onMessage}
                activeSymbols={ActiveMarkets}
                enableRouting
                removeAllComparisons={settings.historical}
                topWidgets={this.renderTopWidgets}
                toolbarWidget={this.renderToolbarWidget}
                chartControlsWidgets={this.renderControls}
                requestAPI={requestAPI}
                requestSubscribe={requestSubscribe}
                requestForget={requestForget}
                settings={settings}
                endEpoch={endEpoch}
                chartType={this.state.chartType}
                granularity={this.state.granularity}
                crosshair={isMobile ? 0 : null}
                crosshairTooltipLeftAllow={660}
                onSettingsChange={this.saveSettings}
                isConnectionOpened={isConnectionOpened}
                networkStatus={networkStatus}
                shouldFetchTradingTimes
                enabledChartFooter
            >
                {endEpoch ? (
                    <Marker
                        className="chart-marker-historical"
                        markerRef={this.onMarkerRef}
                    ><span>{moment(endEpoch * 1000).utc().format('DD MMMM YYYY - HH:mm')}</span>
                    </Marker>
                ) : ''}
            </SmartChart>
        );
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('root'),
);
