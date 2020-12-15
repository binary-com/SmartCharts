import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { CSSTransition } from 'react-transition-group';
import classNames from 'classnames';
import MenuMobile from './MenuMobile.jsx';
import Tooltip from './Tooltip.jsx';
import { CloseIcon } from './Icons.jsx';

class Menu extends Component {
    onOverlayClick = e => {
        if (e.target.className === 'cq-modal__overlay') {
            this.props.handleCloseDialog();
        }
    };

    render() {
        const {
            open,
            dialogStatus,
            className,
            children,
            title,
            tooltip,
            onTitleClick,
            DropdownDialog,
            isMobile,
            isFullscreen,
            portalNodeId,
            enabled = true,
            shouldRenderDialogs,
            handleCloseDialog,
            onMouseEnter,
            onMouseLeave,
            theme,
            enableTabular,
            ready,
            customHead,
            emptyMenu,
            modalMode,
        } = this.props;

        if (!ready) return '';

        const first = React.Children.map(children, (child, i) => (i === 0 ? child : null));
        const rest = React.Children.map(children, (child, i) => (i !== 0 ? child : null));
        if (modalMode) {
            const portalNode = document.getElementById(portalNodeId || 'smartcharts_modal');
            const newDialog = ReactDOM.createPortal(
                <div className={`smartcharts-${theme}`}>
                    <div className={`smartcharts-${isMobile ? 'mobile' : 'desktop'}`}>
                        <div className={`cq-modal-dropdown ${className || ''} ${open && 'stxMenuActive'}`}>
                            <div className='cq-modal__overlay' onClick={this.onOverlayClick}>
                                <CSSTransition
                                    appear
                                    in={dialogStatus}
                                    timeout={300}
                                    classNames='sc-dialog'
                                    unmountOnExit
                                >
                                    <DropdownDialog
                                        isMobile={isMobile}
                                        isFullscreen={isFullscreen}
                                        title={title}
                                        handleCloseDialog={handleCloseDialog}
                                        enableTabular={enableTabular}
                                        customHead={customHead}
                                    >
                                        {rest}
                                    </DropdownDialog>
                                </CSSTransition>
                            </div>
                        </div>
                    </div>
                </div>,
                portalNode
            );

            if (emptyMenu) {
                return open && newDialog;
            }

            return (
                <Tooltip
                    className={classNames('ciq-menu', className || '', {
                        stxMenuActive: enabled && open,
                        'ciq-enabled': enabled,
                        'ciq-disabled': !enabled,
                    })}
                    content={tooltip}
                    enabled={tooltip}
                    position='right'
                >
                    <div
                        className='cq-menu-btn'
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={onMouseLeave}
                        onClick={enabled ? onTitleClick : () => null}
                    >
                        {first}
                    </div>
                    {enabled && open && newDialog}
                </Tooltip>
            );
        }

        const oldDropdown = shouldRenderDialogs && (
            <DropdownDialog
                className={classNames('cq-menu-dropdown', {
                    'cq-menu-dropdown-enter-done': dialogStatus,
                })}
                isMobile={isMobile}
                isFullscreen={isFullscreen}
            >
                {title && (
                    <div className='title'>
                        <div className='title-text'>{title}</div>
                        <CloseIcon className='icon-close-menu' onClick={onTitleClick} />
                    </div>
                )}
                {rest}
            </DropdownDialog>
        );

        return (
            (enabled && (
                <div className={`ciq-menu ciq-enabled ${className || ''} ${open && 'stxMenuActive'}`}>
                    <div
                        className='cq-menu-btn'
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={onMouseLeave}
                        onClick={onTitleClick}
                    >
                        {first}
                    </div>
                    {(isMobile && portalNodeId && (
                        <MenuMobile
                            className={className}
                            open={open}
                            menu_element={oldDropdown}
                            portalNodeId={portalNodeId}
                            onClick={this.onOverlayClick}
                        />
                    )) ||
                        oldDropdown}
                </div>
            )) || (
                <div className={`ciq-menu ciq-disabled ${className || ''}`}>
                    <div className='cq-menu-btn' onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
                        {first}
                    </div>
                </div>
            )
        );
    }
}

Menu.Title = ({ children }) => children;
Menu.Body = ({ children }) => children;

export default Menu;
