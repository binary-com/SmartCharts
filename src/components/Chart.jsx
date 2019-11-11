import React, { Component } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import RenderInsideChart from './RenderInsideChart.jsx';
import ComparisonList from './ComparisonList.jsx';
import ChartTitle from './ChartTitle.jsx';
import AssetInformation from './AssetInformation.jsx';
import Loader from './Loader.jsx';
import Barrier from './Barrier.jsx';
import BottomWidget from './BottomWidget.jsx';
import BottomWidgetsContainer from './BottomWidgetsContainer.jsx';
import DrawingCursor from './DrawingCursor.jsx';
import ChartTable from './ChartTable.jsx';
import NavigationWidget from './NavigationWidget.jsx';
import HighestLowestMarker from './HighestLowestMarker.jsx';
/* css + scss */
import '../../sass/main.scss';
import 'react-tabs/style/react-tabs.css';

import './ui';

import ChartControls from './ChartControls.jsx';
import Crosshair from './Crosshair.jsx';
import { connect } from '../store/Connect';
import { initGA, logPageView } from '../utils/ga';
import PaginationLoader from './PaginationLoader.jsx';

class Chart extends Component {
    constructor(props) {
        super(props);
        this.modalNode = React.createRef();
        this.root = React.createRef();
    }

    componentDidMount() {
        const { updateProps, init, ...props } = this.props;
        initGA();
        logPageView();
        updateProps(props);
        init(this.root.current, this.modalNode.current, props);
    }

    componentDidUpdate(prevProps) {
        const { updateProps, init, ...props } = this.props;
        const { updateProps: prevUpdateProps, init: prevInit, ...previousProps } = prevProps;

        if (previousProps !== props) {
            updateProps(props);
        }
    }

    componentWillUnmount() {
        this.props.destroy();
    }

    defaultTopWidgets = () => (
        <>
            <ChartTitle />
            <AssetInformation />
            <ComparisonList />
        </>
    );

    render() {
        const {
            DrawToolsSettingsDialog,
            StudySettingsDialog,
            isCandle,
            isSpline,
            isMobile = false,
            isChartAvailable,
            isHighestLowestMarkerEnabled,
            barriers = [],
            children,
            chartControlsWidgets,
            AggregateChartSettingsDialog,
            topWidgets,
            chartContainerHeight,
            containerWidth,
            isChartClosed,
            isDrawing,
            theme,
            position,
            bottomWidgets,
            enabledNavigationWidget,
            SimpleDialog,
            TabularDialog,
        } = this.props;

        const currentPosition = `cq-chart-control-${(chartControlsWidgets && position && !isMobile) ? position : 'bottom'}`;
        const contextWidth =  !isMobile ? `smartcharts-${containerWidth}` : '';
        const TopWidgets = topWidgets || this.defaultTopWidgets;
        // if there are any markers, then increase the subholder z-index
        const HasMarkers = children && children.length ? 'smartcharts--has-markers' : '';

        return (
            <div className={`smartcharts smartcharts-${theme} ${enabledNavigationWidget ? 'smartcharts--navigation-widget' : ''} ${HasMarkers} ${contextWidth}`}>
                <div
                    className={`smartcharts-${isMobile ? 'mobile' : 'desktop'}`}
                    ref={this.modalNode}
                >
                    <div
                        className="cq-context"
                        ref={this.root}
                    >
                        <div className={` ${currentPosition}`}>
                            <div className="ciq-chart-area">
                                <div className={`ciq-chart ${isChartClosed ? 'closed-chart' : ''}`}>
                                    <RenderInsideChart at="holder">
                                        {barriers.map((barr, idx) => (
                                            <Barrier
                                                key={`barrier-${idx}`} // eslint-disable-line react/no-array-index-key
                                                {...barr}
                                            />
                                        ))}
                                    </RenderInsideChart>
                                    <RenderInsideChart at="subholder">
                                        {
                                            !isCandle && !isSpline && isHighestLowestMarkerEnabled
                                                && <HighestLowestMarker />
                                        }
                                    </RenderInsideChart>
                                    <RenderInsideChart at="subholder" hideInScrollToEpoch>
                                        {children}
                                    </RenderInsideChart>
                                    <RenderInsideChart at="subholder">
                                        <PaginationLoader />
                                    </RenderInsideChart>
                                    <div className="cq-top-ui-widgets">
                                        <TopWidgets />
                                    </div>
                                    {
                                        enabledNavigationWidget
                                            && <NavigationWidget />
                                    }
                                    <div className={`chartContainer ${isDrawing ? 'ciq-draw-mode' : ''}`} style={{ height: chartContainerHeight }}>
                                        <Crosshair />
                                        <DrawingCursor />
                                    </div>
                                    <Loader />
                                    {!isChartAvailable && (
                                        <div className="cq-chart-unavailable">
                                            {t.translate('Chart data is not available for this symbol.')}
                                        </div>
                                    )}
                                    <BottomWidgetsContainer>
                                        <BottomWidget bottomWidgets={bottomWidgets} />
                                    </BottomWidgetsContainer>
                                </div>
                                { chartControlsWidgets !== null
                                    && <ChartControls widgets={chartControlsWidgets} />
                                }
                            </div>
                        </div>
                    </div>
                    <DrawToolsSettingsDialog />
                    <AggregateChartSettingsDialog />
                    <StudySettingsDialog />
                    <ChartTable />
                    {SimpleDialog ? (
                        <SimpleDialog
                            className="cq-dialog cq-settings-dialog"
                            title="Simple Dialog"
                            enableTabular={false}
                            enableOverlay
                        >
                            <div className="items">
                                <div style={{
                                    padding: 30,
                                    fontSize: 13,
                                }}
                                >
                                    <p>
                                        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
                                        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                                        quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
                                        consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
                                        cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
                                        proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                                    </p>
                                </div>
                            </div>
                        </SimpleDialog>
                    ) : ''}
                    { TabularDialog ? (
                        <TabularDialog
                            className="cq-dialog cq-settings-dialog"
                            title="Tabular Dialog"
                            enableTabular
                            enableOverlay
                        >
                            <Tabs className="tabs--vertical">
                                <TabList>
                                    <Tab>Settings</Tab>
                                    <Tab>Description</Tab>
                                </TabList>
                                <TabPanel>
                                    <div className="items">
                                        <div style={{
                                            padding: 30,
                                            fontSize: 13,
                                        }}
                                        >
                                            <h3> Settings Content </h3>
                                            <p>
                                                Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
                                                tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                                                quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
                                                consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
                                                cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
                                                proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                                            </p>
                                        </div>
                                    </div>
                                </TabPanel>
                                <TabPanel>
                                    <div className="items">
                                        <div style={{
                                            padding: 30,
                                            fontSize: 13,
                                        }}
                                        >
                                            <h3> Description Content </h3>
                                            <p>
                                                Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
                                                tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                                                quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
                                                consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
                                                cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
                                                proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                                            </p>
                                        </div>
                                    </div>
                                </TabPanel>
                            </Tabs>
                        </TabularDialog>
                    ) : ''}
                </div>
            </div>
        );
    }
}

export default connect(({
    chart,
    drawTools,
    studies,
    chartSetting,
    chartType,
    state,
    drawingCursor,
}) => ({
    init: chart.init,
    destroy: chart.destroy,
    StudySettingsDialog : studies.StudySettingsDialog,
    DrawToolsSettingsDialog : drawTools.DrawToolsSettingsDialog,
    AggregateChartSettingsDialog : chartType.AggregateChartSettingsDialog,
    isCandle: chartType.isCandle,
    isChartAvailable: chart.isChartAvailable,
    isSpline: chartType.isSpline,
    updateProps: state.updateProps,
    chartContainerHeight: chart.chartContainerHeight,
    containerWidth: chart.containerWidth,
    isChartClosed: state.isChartClosed,
    isDrawing: drawingCursor.isDrawing,
    theme: chartSetting.theme,
    position: chartSetting.position,
    isHighestLowestMarkerEnabled: chartSetting.isHighestLowestMarkerEnabled,
    SimpleDialog: chart.SimpleDialog,
    TabularDialog: chart.TabularDialog,
}))(Chart);
