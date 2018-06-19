/* eslint-disable no-new, react/jsx-indent, react/no-danger, react/jsx-indent-props */
import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import RenderInsideChart from './RenderInsideChart.jsx';
import ComparisonList from './ComparisonList.jsx';
import ChartTitle from './ChartTitle.jsx';
import AssetInformation from './AssetInformation.jsx';
import Loader from './Loader.jsx';
import Barrier from './Barrier.jsx';

/* css + scss */
import '../../sass/app.scss';

import '../Plugin';
import './ui';

import ChartControls from './ChartControls.jsx';
import SettingsDialog from './SettingsDialog.jsx';
import Notification from './Notification.jsx';
import Crosshair from './Crosshair.jsx';
import { connect } from '../store/Connect';

const defaultTopWidgets = () => (
    <Fragment>
        <ChartTitle />
        <AssetInformation />
        <ComparisonList />
    </Fragment>
);

class Chart extends Component {
    static childContextTypes = { promise: PropTypes.object };

    getChildContext() {
        return { promise: this.props.contextPromise };
    }

    componentDidMount() {
        this.props.init(this.root, this.props);
    }

    componentWillUnmount() {
        this.props.destroy();
    }
    
    render() {
        const {
            DrawToolsSettingsDialog,
            StudySettingsDialog,
            children,
            isMobile = false,
            isChartAvailable,
            settings,
            chartProps,
            barriers,
            chartPanelTop,
            chartControlsWidgets,
            AggregateChartSettingsDialog,
            topWidgets
        } = this.props;

        const currentLang = (chartProps && chartProps.language) ? chartProps.language : 'en';
        t.setLanguage(currentLang);
        const currentPosition = `cq-chart-control-${(chartProps && chartProps.position && !isMobile) ? chartProps.position : 'bottom'}`;
        const currentMode = `${isMobile ? 'smartcharts-mobile' : ''}`;
        const array = React.Children.toArray(children);
        const insideSubHolder = array.filter(c => /(TradeStart)|(TradeEnd)/.test(c.type.displayName));
        const renderTopWidgets = topWidgets || defaultTopWidgets;

        return (
            <cq-context
                ref={(root) => { this.root = root; }}
                class={`smartcharts-${chartProps.theme}`}
            >
                <div className={`${currentMode} ${currentPosition}`}>
                    <div className="ciq-chart-area">
                        <div className="ciq-chart">
                            {barriers &&
                            <RenderInsideChart at="holder">
                                {barriers.map((barr, idx) => (
                                    <Barrier
                                        key={idx}
                                        {...barr}
                                    />
                                ))}
                            </RenderInsideChart>}
                            <RenderInsideChart at="subholder">
                                {insideSubHolder}
                            </RenderInsideChart>
                            <div className="cq-top-ui-widgets" style={{ top: chartPanelTop }}>
                                { renderTopWidgets() }
                            </div>
                            <ChartControls widgets={chartControlsWidgets} />
                            <Crosshair />
                            <div className="chartContainer primary" />
                            <Loader />
                            {!isChartAvailable &&
                                <div className="cq-chart-unavailable">
                                    {t.translate('Chart data is not available for this symbol.')}
                                </div>}
                        </div>
                    </div>
                    <DrawToolsSettingsDialog />
                    <AggregateChartSettingsDialog />
                    <StudySettingsDialog />
                    <Notification />
                </div>
            </cq-context>
        );
    }
}

export default connect(({ chart, drawTools, studies, chartProps, chartType }) => ({
    contextPromise: chart.contextPromise,
    init: chart.init,
    destroy: chart.destroy,
    StudySettingsDialog : studies.settingsDialog.connect(SettingsDialog),
    DrawToolsSettingsDialog : drawTools.settingsDialog.connect(SettingsDialog),
    AggregateChartSettingsDialog : chartType.settingsDialog.connect(SettingsDialog),
    isChartAvailable: chart.isChartAvailable,
    chartPanelTop: chart.chartPanelTop,
    chartProps: chartProps
}))(Chart);
