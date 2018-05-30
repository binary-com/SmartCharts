import React from 'react';
import Menu from './Menu.jsx';
import { connect } from '../store/Connect';
import {
    ShareIcon,
    CopyIcon,
    CloseIcon
} from './Icons.jsx';
import '../../sass/components/_ciq-share.scss';


const Share = ({
    Menu,
    menuOpen,
    loading,
    urlGenerated,
    shortUrlFailed,
    refereshShareLink,
    shareLink,
    downloadCSV,
    downloadPNG,
    copyToClipboard,
    resetCopyTooltip,
    copyTooltip,
    onInputRef,
    closeMenu
}) => {
    return (
        <Menu className="cq-share">
            <Menu.Title>
                <ShareIcon
                    className = {`ic-icon-with-sub ${menuOpen ? 'active' : ''}`}
                    tooltip-title={t.translate("Share")}
                />
            </Menu.Title>
            <Menu.Body>
                <div className='title'>
                    <div className="title-text">{t.translate('Share / Download Chart')}</div>
                    <CloseIcon className="icon-close-menu"
                        onClick={ () => closeMenu() }
                        />
                </div>
                <div className='body'>
                    <div className='caption1'>{t.translate('Share link')}</div>
                    <div className="loading"
                        style={{display: (loading ? 'block' : 'none')}}
                    ></div>
                    <div className='content'
                        style={{display: ((!loading && !urlGenerated) ? 'flex' : 'none' )}}>
                        {shortUrlFailed ? <p>{t.translate('Failed to generate link')}</p> : <div
                            className='download-btn'
                            onClick={refereshShareLink}
                            >
                            {t.translate('Retry')}
                        </div>}
                    </div>
                    <div className='content'
                        style={{display: ((!loading && urlGenerated) ? 'flex' : 'none' )}}
                    >
                        <input
                            ref={onInputRef}
                            value={shareLink}
                        />
                        <CopyIcon
                            className='ciq-tooltip'
                            onClick={copyToClipboard}
                            onMouseOut={resetCopyTooltip}
                            tooltip-title={copyTooltip}
                        />
                    </div>

                    <div className='caption2'>{t.translate('Download chart')}</div>
                    <div className='content'>
                        <div
                            className='download-btn'
                            onClick={downloadPNG}
                        > PNG </div>
                        <div
                            className='download-btn'
                            onClick={downloadCSV}
                        > CSV </div>
                    </div>
                </div>
            </Menu.Body>
        </Menu>
    );
};

export default connect(({share: s}) => ({
    Menu: s.menu.connect(Menu),
    menuOpen: s.menu.dialog.open,
    loading: s.loading,
    urlGenerated: s.urlGenerated,
    shortUrlFailed: s.shortUrlFailed,
    refereshShareLink: s.refereshShareLink,
    shareLink: s.shareLink,
    downloadPNG: s.downloadPNG,
    downloadCSV: s.downloadCSV,
    copyToClipboard: s.copyToClipboard,
    onInputRef: s.onInputRef,
    resetCopyTooltip:  s.resetCopyTooltip,
    copyTooltip: s.copyTooltip,
    closeMenu: s.menu.onTitleClick,
}))(Share);
