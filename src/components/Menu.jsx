import React, { Component } from 'react';
import { CSSTransition } from 'react-transition-group';
import { stxtap } from '../store/utils';

class Menu extends Component {
    render() {
        const {
            open,
            className,
            children,
            onTitleClick,
            DropdownDialog,
            isMobile,
        } = this.props;
        const first = React.Children.map(children, (child, i) => (i === 0 ? child : null));
        const rest  = React.Children.map(children, (child, i) => (i !== 0 ? child : null));
        const menuOverLayStyle = isMobile ? { height: `${window.innerHeight}px`, top : `${-window.innerHeight + 31}px` } : {};

        return (
            <div className={`ciq-menu ${className || ''} ${open ? 'stxMenuActive' : ''}`}>
                <div
                    className="cq-menu-btn"
                    ref={el => stxtap(el, onTitleClick)}
                >
                    {first}
                </div>
                <div className="cq-menu-overlay" style={menuOverLayStyle}>
                    <CSSTransition
                        in={open}
                        timeout={150}
                        classNames="cq-menu-dropdown"
                    >
                        <DropdownDialog
                            className="cq-menu-dropdown"
                        >
                            {rest}
                        </DropdownDialog>
                    </CSSTransition>
                </div>
            </div>
        );
    }
}

Menu.Title = ({ children }) => children;
Menu.Body  = ({ children }) => children;

export default Menu;
