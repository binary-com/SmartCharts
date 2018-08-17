/* eslint-disable jsx-a11y/no-static-element-interactions */

import React from 'react';
import { CSSTransition } from 'react-transition-group';
import { connect } from '../store/Connect';
import { Switch } from './Form.jsx';
import {
    PositionLeftIcon,
    PositionBottomIcon,
    SettingIcon,
    BackIcon,
    CloseIcon,
} from './Icons.jsx';
import '../../sass/components/_ciq-chart-setting.scss';

const AssetInformationToggle = ({
    value,
    onChange,
}) => (
    <div className="ciq-list-item">
        <span className="ciq-icon-text">{t.translate('Asset Information')}</span>
        <div className="ciq-action">
            <Switch
                value={value}
                onChange={onChange}
            />
        </div>
    </div>
);

const ThemeToggle = ({
    position,
    setPosition,
}) => (
    <div className="ciq-list-item ciq-list-item-position">
        <span className="ciq-icon-text">{t.translate('Position')}</span>
        <div className="ciq-action">
            <PositionBottomIcon
                onClick={() => setPosition('bottom')}
                className={`${position === 'bottom' ? 'active' : ''}`}
            />
            <PositionLeftIcon
                onClick={() => setPosition('left')}
                className={`${position === 'left' ? 'active' : ''}`}
            />
        </div>
    </div>
);

const ChartSetting = ({
    ChartSettingMenu,
    menuOpen,
    selectedLanguage,
    languages,
    position,
    setPosition,
    setView,
    view,
    setLanguage,
    theme,
    setTheme,
    countdown,
    showCountdown,
    closeMenu,
    assetInformation,
    setAssetInformation,
    isMobile,
}) => {
    const renderMain = () => (
        <div>
            <div className="title">
                <div className="title-text"> {t.translate('Settings')} </div>
                <CloseIcon className="icon-close-menu" onClick={() => closeMenu()} />
            </div>
            <div className="body">
                <div className="ciq-list ciq-list-setting">
                    {!isMobile ? <ThemeToggle setPosition={setPosition} position={position} /> : ''}
                    <div className="ciq-list-item">
                        <span className="ciq-icon-text">{t.translate('Dark Mode')}</span>
                        <div className="ciq-action">
                            <Switch
                                value={(theme === 'dark')}
                                onChange={checked => setTheme(checked ? 'dark' : 'light')}
                            />
                        </div>
                    </div>
                    <div className="ciq-list-item">
                        <span className="ciq-icon-text">{t.translate('Countdown')}</span>
                        <div className="ciq-action">
                            <Switch
                                value={countdown}
                                onChange={showCountdown}
                            />
                        </div>
                    </div>
                    {!isMobile ? <AssetInformationToggle value={assetInformation} onChange={setAssetInformation} /> : ''}
                    <div
                        className="ciq-list-item ciq-list-item-lng"
                        onClick={() => setView('language')}
                    >
                        <span className="ciq-icon-text">{t.translate('Language')}</span>
                        <div className="ciq-action">
                            {selectedLanguage.icon}
                        </div>
                    </div>
                </div>
            </div>
        </div>);
    const renderLanguage = () => (
        <div>
            <div className="title">
                <BackIcon
                    onClick={() => setView()}
                />
                {t.translate('Language')}
            </div>
            <div className="body">
                <div className="ciq-list ciq-list-language">
                    {languages.map(language => (
                        <div
                            className={`ciq-list-item ${(selectedLanguage.key === language.key) ? 'selected' : ''}`}
                            key={language.key}
                            onClick={() => setLanguage(language.key)}
                        >
                            {language.icon}
                            <span className="ciq-icon-text">{language.name}</span>
                        </div>))}
                </div>
            </div>
        </div>);
    return (
        <ChartSettingMenu className="cq-chart-setting">
            <ChartSettingMenu.Title>
                <SettingIcon
                    className={`ic-icon-with-sub ${menuOpen ? 'active' : ''}`}
                    tooltip-title={t.translate('Settings')}
                />
            </ChartSettingMenu.Title>
            <ChartSettingMenu.Body>
                <div className={`cq-setting-container container-${view === '' ? 'main' : view}`}>
                    <CSSTransition
                        in={view === ''}
                        timeout={250}
                        classNames="cq-setting-main animate"
                        unmountOnExit
                    >
                        {renderMain()}
                    </CSSTransition>

                    <CSSTransition
                        in={view === 'language'}
                        timeout={250}
                        classNames="cq-setting-language animate"
                        unmountOnExit
                    >
                        {renderLanguage()}
                    </CSSTransition>
                </div>
            </ChartSettingMenu.Body>
        </ChartSettingMenu>
    );
};

export default connect(({ chartSetting: s, chart: c }) => ({
    ChartSettingMenu: s.ChartSettingMenu,
    menuOpen: s.menu.dialog.open,
    selectedLanguage: s.language,
    languages: s.languages,
    position: s.position,
    setPosition: s.setPosition,
    setView: s.setView,
    view: s.view,
    setLanguage: s.setLanguage,
    theme: s.theme,
    setTheme: s.setTheme,
    countdown: s.countdown,
    showCountdown: s.showCountdown,
    closeMenu: s.menu.onTitleClick,
    assetInformation: s.assetInformation,
    setAssetInformation: s.setAssetInformation,
    isMobile: c.isMobile,
}))(ChartSetting);
