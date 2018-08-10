import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { CSSTransition } from 'react-transition-group';

class Menu extends Component {
    onOverlayClick = (e) => {
        if (e.target.className === 'cq-menu-overlay') {
            this.props.setOpen(false);
        }
    };

    render() {
        const {
            open,
            className,
            children,
            onTitleClick,
            DropdownDialog,
            isMobile,
            isFullscreen,
            modalNode,
            enabled = true,
        } = this.props;
        const first = React.Children.map(children, (child, i) => (i === 0 ? child : null));
        const rest  = React.Children.map(children, (child, i) => (i !== 0 ? child : null));

        const dropdown = (
            <CSSTransition
                in={open}
                timeout={150}
                classNames="cq-menu-dropdown"
            >
                <DropdownDialog
                    className="cq-menu-dropdown"
                    isMobile={isMobile}
                    isFullscreen={isFullscreen}
                >
                    {rest}
                </DropdownDialog>
            </CSSTransition>);

        return (
            enabled && (
                <div className={`ciq-menu ciq-enabled ${className || ''} ${open ? 'stxMenuActive' : ''}`}>
                    <div
                        className="cq-menu-btn"
                        onClick={onTitleClick}
                    >
                        {first}
                    </div>
                    {(isMobile && modalNode)
                    && ReactDOM.createPortal(
                        <div className={`cq-modal-dropdown ${className || ''} ${open ? 'stxMenuActive' : ''}`}>
                            <div
                                className="cq-menu-overlay"
                                onClick={this.onOverlayClick}
                            >
                                {dropdown}
                            </div>
                        </div>,
                        modalNode,
                    )
                || (dropdown)}
                </div>
            ) || (
                <div className={`ciq-menu ciq-disabled ${className || ''}`}>
                    <div className="cq-menu-btn">
                        {first}
                    </div>
                </div>
            )
        );
    }
}

Menu.Title = ({ children }) => children;
Menu.Body  = ({ children }) => children;

export default Menu;
