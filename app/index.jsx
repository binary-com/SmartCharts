import { // eslint-disable-line import/no-extraneous-dependencies,import/no-unresolved
    SmartChart,
    // Barrier,
    // TradeStartLine,
    // TradeEndLine,
    ChartTypes,
    StudyLegend,
    Comparison,
    Views,
    CrosshairToggle,
    Timeperiod,
    ChartSize,
    DrawTools,
    Share
} from '@binary-com/smartcharts'; // eslint-disable-line import/no-unresolved
import React from 'react';
import ReactDOM from 'react-dom';
import { configure } from 'mobx';
import ChartSetting from './components/ChartSetting.jsx'
import './app.scss';
import './doorbell';
import { ConnectionManager, StreamManager } from './connection';

configure({ enforceActions: true });

const getLocalStorage = function () {
    const default_setting =  { language : 'en' , position : 'bottom' , theme : 'light' , countdown : 'false'};
    try {
        const setting_string = CIQ.localStorage.getItem('smartchart-setting'),
            setting = JSON.parse(setting_string !== '' ? setting_string : '{}');
        return setting;
    } catch (e) {
        return default_setting;
    }
};

const settings = getLocalStorage();

const connectionManager = new ConnectionManager({
    appId: 12812,
    language: settings.language,
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
const App = () => (
        <SmartChart
            onSymbolChange={symbol => console.log('Symbol has changed to:', symbol)}
            isMobile={CIQ.isMobile}
            chartControlsWidgets={renderControls}
            requestAPI={requestAPI}
            requestSubscribe={requestSubscribe}
            requestForget={requestForget}
            shareOrigin={shareOrigin}
            settings={settings}
        />
);

ReactDOM.render(
    <App />,
    document.getElementById('root'),
);
