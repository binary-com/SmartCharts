import { // eslint-disable-line import/no-extraneous-dependencies,import/no-unresolved
    SmartChart,
    ChartTypes,
    StudyLegend,
    Comparison,
    Views,
    CrosshairToggle,
    Timeperiod,
    ChartSize,
    DrawTools,
    ChartSetting,
    Share,
    ChartTitle,
    AssetInformation,
    ComparisonList,
} from '@binary-com/smartcharts'; // eslint-disable-line import/no-unresolved
import React from 'react';
import ReactDOM from 'react-dom';
import { configure } from 'mobx';
import './app.scss';
import './doorbell';
import { ConnectionManager, StreamManager } from './connection';
import Notification from './libs/Notification.jsx';

if (window.location.host.endsWith('binary.com')) {
    window._trackJs = { token: '346262e7ffef497d85874322fff3bbf8', application: 'smartcharts' };
    const s = document.createElement('script');
    s.src = 'https://cdn.trackjs.com/releases/current/tracker.js';
    document.body.appendChild(s);
}

configure({ enforceActions: true });

const getLanguageStorage = function () {
    const default_language = 'en';
    try {
        const setting_string = CIQ.localStorage.getItem('smartchart-setting'),
            setting = JSON.parse(setting_string !== '' ? setting_string : '{}');

        return setting.language || default_language;
    } catch (e) {
        return default_language;
    }
};

const connectionManager = new ConnectionManager({
    appId: 12812,
    language: getLanguageStorage(),
    endpoint: 'wss://ws.binaryws.com/websockets/v3',
});

const streamManager = new StreamManager(connectionManager);
const renderControls = () => (
    <React.Fragment>
        {CIQ.isMobile ? '' : <CrosshairToggle />}
        <ChartTypes />
        <StudyLegend />
        <Comparison />
        <DrawTools />
        <Views />
        <Share />
        <Timeperiod />
        {CIQ.isMobile ? '' : <ChartSize />}
        <ChartSetting />
    </React.Fragment>
);
const requestAPI = connectionManager.send.bind(connectionManager);
const requestSubscribe = streamManager.subscribe.bind(streamManager);
const requestForget = streamManager.forget.bind(streamManager);
const shareOrigin = window.location.href.split('?')[0];
function Notifier() {
    this.messages = [];
    this.notify = (message) => {
        message.id = (new Date()).getTime();
        /**
         * 'warning' | 'error' | 'message' | 'success',
         */
        message.type = message.type || 'warning';
        message.hide = false;

        this.messages.push(message);
    };
    this.remove = (id) => {
        this.messages = this.messages.filter(item => item.id !== id);
    };
}
const n = new Notifier();
const renderTopWidgets = () => (
    <React.Fragment>
        <ChartTitle />
        <AssetInformation />
        <ComparisonList />
        <Notification notifier={n} />
    </React.Fragment>
);
const App = () => (
    <SmartChart
        onSymbolChange={symbol => console.log('Symbol has changed to:', symbol)}
        onMessage={n.notify}
        isMobile={CIQ.isMobile}
        enableRouting
        topWidgets={renderTopWidgets}
        chartControlsWidgets={renderControls}
        requestAPI={requestAPI}
        requestSubscribe={requestSubscribe}
        requestForget={requestForget}
        shareOrigin={shareOrigin}
    />
);
ReactDOM.render(
    <App />,
    document.getElementById('root'),
);
