import React from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { useStores } from 'src/store';
import { TMainStore } from 'src/types';
import CrosshairToggle from './CrosshairToggle';
import '../../sass/components/_navigation-widget.scss';

import { ScaleIcon, ZoominIcon, ZoomoutIcon } from './Icons';

type TNavigationWidgetProps = {
    onCrosshairChange?: TMainStore['crosshair']['onCrosshairChanged'];
};

const NavigationWidget = ({ onCrosshairChange }: TNavigationWidgetProps) => {
    const { chart, chartSize, navigationWidget, chartSetting, chartAdapter } = useStores();
    const { context, startWithDataFitMode } = chart;
    const { zoomIn, zoomOut } = chartSize;
    const { historical } = chartSetting;
    const { onMouseEnter, onMouseLeave } = navigationWidget;
    const { isDataFitModeEnabled, toggleDataFitMode } = chartAdapter;

    return context ? (
        <div
            className={classNames('sc-navigation-widget', {
                'sc-navigation-widget__item--indent': historical,
            })}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div
                className={classNames('sc-navigation-widget__item', 'sc-navigation-widget__item--scale', {
                    'sc-navigation-widget__item--hidden': !startWithDataFitMode,
                    'sc-navigation-widget__item--disabled': isDataFitModeEnabled,
                })}
                onClick={toggleDataFitMode}
            >
                <ScaleIcon />
            </div>
            <div className='sc-navigation-widget__item sc-navigation-widget__item--zoom'>
                <ZoominIcon onClick={zoomIn} />
                <CrosshairToggle onChange={onCrosshairChange} />
                <ZoomoutIcon onClick={zoomOut} />
            </div>
        </div>
    ) : null;
};

export default observer(NavigationWidget);
