import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import React from 'react';
import 'react-tabs/style/react-tabs.css';
import { useStores } from 'src/store';
import { TChartProps } from 'src/types';
import { usePrevious } from '../hooks';

/* css + scss */
import '../../sass/main.scss';
import { initGA, logPageView } from '../utils/ga';
import Barrier from './Barrier';
import BottomWidget from './BottomWidget';
import BottomWidgetsContainer from './BottomWidgetsContainer';
import ChartControls from './ChartControls';
import ChartFooter from './ChartFooter';
import ChartTitle from './ChartTitle';
import Crosshair from './Crosshair';
import HighestLowestMarker from './HighestLowestMarker';
import IndicatorPredictionDialog from './IndicatorPredictionDialog';
import Loader from './Loader';
import NavigationWidget from './NavigationWidget';
import PaginationLoader from './PaginationLoader';
import RenderInsideChart from './RenderInsideChart';
import SettingsDialog from './SettingsDialog';
import ScrollToRecent from './ScrollToRecent';

const Chart = (props: TChartProps) => {
    const { chart, drawTools, studies, chartSetting, chartType, state, loader, chartAdapter, crosshair } = useStores();
    const { chartId, init, destroy, isChartAvailable, chartContainerHeight, containerWidth } = chart;
    const { setCrosshairState } = crosshair;
    const { settingsDialog: studiesSettingsDialog } = studies;
    const { settingsDialog: drawToolsSettingsDialog } = drawTools;
    const { settingsDialog: chartTypeSettingsDialog, isCandle, isSpline } = chartType;
    const { updateProps, isChartClosed } = state;
    const { theme, position, isHighestLowestMarkerEnabled } = chartSetting;
    const { isActive: isLoading, show: showChart } = loader;

    const rootRef = React.useRef<HTMLDivElement>(null);
    const chartContainerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        initGA();
        logPageView();
        updateProps(props);
        init(rootRef.current, props);

        return () => {
            destroy();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        updateProps(props);
    });

    const prevLang = usePrevious(t.lang);
    React.useEffect(() => {
        if (prevLang && prevLang !== t.lang && !isLoading) {
            showChart?.();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [t.lang]);

    const defaultTopWidgets = () => <ChartTitle />;

    const {
        id,
        isMobile = false,
        barriers = [],
        children,
        chartControlsWidgets,
        topWidgets,
        bottomWidgets,
        enabledChartFooter = true,
        enabledNavigationWidget = true,
        toolbarWidget = () => null,
        onCrosshairChange = () => null,
        historical,
        contracts_array = [],
    } = props;

    const hasPosition = chartControlsWidgets && position && !isMobile;
    const TopWidgets = topWidgets || defaultTopWidgets;
    // if there are any markers, then increase the subholder z-index
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const ToolbarWidget = React.useCallback(toolbarWidget, [t.lang]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const memoizedOnCrosshairChange = React.useCallback(onCrosshairChange, [t.lang]);

    React.useEffect(() => {
        chartAdapter.onMount(chartContainerRef.current as HTMLDivElement);
        return () => {
            chartAdapter.onUnmount();
        };
    }, []);

    React.useEffect(() => {
        chartAdapter.updateContracts(contracts_array);
    }, [contracts_array]);

    // to always show price info on mobile screen
    if (isMobile && crosshair.state !== 2) {
        setCrosshairState(2);
    }
    console.log('test');
    return (
        <div
            id={id || chartId}
            className={classNames('smartcharts', `smartcharts-${theme}`, {
                'smartcharts--navigation-widget': enabledNavigationWidget,
                'smartcharts--loading': isLoading,
                'smartcharts--has-markers': children && (children as NodeList).length,
                [`smartcharts-${containerWidth}`]: !isMobile,
            })}
        >
            <div
                className={classNames({
                    'smartcharts-mobile': isMobile,
                    'smartcharts-desktop': !isMobile,
                })}
            >
                <div className='cq-context' ref={rootRef}>
                    <div
                        className={classNames({
                            [`cq-chart-control-${position}`]: hasPosition,
                            'cq-chart-control-bottom': !hasPosition,
                        })}
                    >
                        <div className='ciq-chart-area'>
                            <div className={classNames('ciq-chart', { 'closed-chart': isChartClosed })}>
                                <RenderInsideChart at='subholder'>
                                    {barriers.map(({ key, ...barr }, idx) => (
                                        <Barrier
                                            key={`barrier-${idx}`} // eslint-disable-line react/no-array-index-key
                                            {...barr}
                                        />
                                    ))}
                                </RenderInsideChart>
                                <RenderInsideChart at='subholder'>
                                    {!isCandle && !isSpline && isHighestLowestMarkerEnabled && <HighestLowestMarker />}
                                </RenderInsideChart>
                                <RenderInsideChart at='subholder'>{children}</RenderInsideChart>
                                <RenderInsideChart at='subholder'>
                                    <PaginationLoader />
                                </RenderInsideChart>
                                {!loader.isActive && (
                                    <div className='cq-top-ui-widgets'>
                                        <TopWidgets />
                                    </div>
                                )}
                                <div
                                    className='chartContainer'
                                    ref={chartContainerRef}
                                    style={{
                                        height:
                                            historical && chartContainerHeight && isMobile
                                                ? chartContainerHeight - 30
                                                : chartContainerHeight,
                                    }}
                                >
                                    <Crosshair />
                                </div>
                                {enabledNavigationWidget && (
                                    <NavigationWidget onCrosshairChange={memoizedOnCrosshairChange} />
                                )}
                                {ToolbarWidget && <ToolbarWidget />}
                                {!isChartAvailable && (
                                    <div className='cq-chart-unavailable'>
                                        {t.translate('Chart data is not available for this symbol.')}
                                    </div>
                                )}
                                <div className='cq-inchart-subholder' />
                                <BottomWidgetsContainer>
                                    <BottomWidget bottomWidgets={bottomWidgets} />
                                </BottomWidgetsContainer>
                            </div>
                            {chartControlsWidgets !== null && !enabledChartFooter && (
                                <ChartControls widgets={chartControlsWidgets} />
                            )}
                            <ScrollToRecent />
                            {enabledChartFooter && <ChartFooter />}
                            <Loader />
                        </div>
                    </div>
                </div>
                <SettingsDialog store={drawToolsSettingsDialog} />
                <SettingsDialog store={chartTypeSettingsDialog} />
                <SettingsDialog store={studiesSettingsDialog} />
                <IndicatorPredictionDialog />
                <div id='smartcharts_modal' className='ciq-modal' />
            </div>
        </div>
    );
};

export default observer(Chart);
