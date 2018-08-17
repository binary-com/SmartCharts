import React from 'react';
import { connect } from '../store/Connect';
import NotificationBadge from './NotificationBadge.jsx';
import { ComparisonIcon } from './Icons.jsx';

const Comparison = ({
    ComparisonSelector,
    ComparisonMenu,
    menuOpen,
    onCloseMenu,
    isMobile,
    activeComparisonsNo,
}) => (
    <ComparisonMenu
        className="cq-comparison-new cq-symbols-display"
        isMobile={isMobile}
    >
        <ComparisonMenu.Title>
            <ComparisonIcon
                className={`ic-icon-with-sub ${menuOpen ? 'active' : ''}`}
                tooltip-title={t.translate('Comparison')}
            />
            <NotificationBadge notificationCount={activeComparisonsNo} />
        </ComparisonMenu.Title>
        <ComparisonMenu.Body>
            <ComparisonSelector
                dialogTitle={t.translate('Comparison')}
                closeMenu={() => onCloseMenu()}
            />
        </ComparisonMenu.Body>
    </ComparisonMenu>
);

export default connect(({ comparison: c }) => ({
    ComparisonSelector: c.ComparisonSelector,
    ComparisonMenu: c.ComparisonMenu,
    menuOpen: c.menu.open,
    onCloseMenu: c.menu.onTitleClick,
    isMobile: c.categoricalDisplay.isMobile,
    activeComparisonsNo: c.mainStore.chart.comparisonSymbols.length,
}))(Comparison);
