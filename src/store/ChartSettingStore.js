import React from 'react';
import { observable, action, when } from 'mobx';
import MenuStore from './MenuStore';
import { FlagIcons } from '../components/Icons.jsx';
import Menu from '../components/Menu.jsx';
import { logEvent, LogCategories, LogActions } from '../utils/ga';

const languageList = [
    {
        key: 'en',
        name: 'English',
        icon: <FlagIcons.USD />,
    }, {
        key: 'pt',
        name: 'Português',
        icon: <FlagIcons.Portugal />,
    }, {
        key: 'de',
        name: 'Deutsch',
        icon: <FlagIcons.German />,
    }, {
        key: 'ru',
        name: 'Русский',
        icon: <FlagIcons.Russia />,
    }, {
        key: 'fr',
        name: 'French',
        icon: <FlagIcons.French />,
    }, {
        key: 'th',
        name: 'Thai',
        icon: <FlagIcons.Thailand />,
    }, {
        key: 'id',
        name: 'Indonesia',
        icon: <FlagIcons.Indonesia />,
    }, {
        key: 'vi',
        name: 'Tiếng Việt',
        icon: <FlagIcons.Vietnam />,
    }, {
        key: 'it',
        name: 'Italiano',
        icon: <FlagIcons.Italy />,
    }, {
        key: 'zh_cn',
        name: '简体中文',
        icon: <FlagIcons.Chinese />,
    }, {
        key: 'pl',
        name: 'Polish',
        icon: <FlagIcons.Poland />,
    }, {
        key: 'zh_tw',
        name: '繁體中文',
        icon: <FlagIcons.ChineseTraditional />,
    }, {
        key: 'es',
        name: 'espanyol',
        icon: <FlagIcons.Spanish />,
    },
];

export default class ChartSettingStore {
    constructor(mainStore) {
        this.defaultLanguage = this.languages[0];
        this.mainStore = mainStore;
        this.menu = new MenuStore(mainStore, { route: 'setting' });
        this.ChartSettingMenu = this.menu.connect(Menu);
        when(() => this.context, () => {
            this.setSettings(mainStore.state.settings);
        });
    }

    get context() { return this.mainStore.chart.context; }
    get stx() { return this.context.stx; }

    languages = [];
    defaultLanguage = {};
    onSettingsChange;
    @observable assetInformation = true;
    @observable view = '';
    @observable language = null;
    @observable position = 'bottom';
    @observable theme = 'light';
    @observable countdown = false;
    @observable historical = false;
    @observable isAutoScale = true;
    @observable isHighestLowestMarkerEnabled = true;

    setSettings(settings) {
        if (settings === undefined) { return; }
        const { assetInformation, countdown, historical, language, position, isAutoScale, isHighestLowestMarkerEnabled, theme, activeLanguages } = settings;

        if (!(
            (!activeLanguages && languageList.every(x => this.languages.find(y => y.key === x.key)))
            || (
                activeLanguages
                && this.languages.length === activeLanguages.length
                && this.languages.every(x => activeLanguages.indexOf(x.key.toUpperCase()) !== -1)
            )
        )) { this.updateActiveLanguage(activeLanguages); }

        if (theme                        !== undefined) { this.setTheme(theme); }
        if (position                     !== undefined) { this.setPosition(position); }
        if (countdown                    !== undefined) { this.showCountdown(countdown); }
        if (language                     !== undefined) { this.setLanguage(language); }
        if (assetInformation             !== undefined) { this.setAssetInformation(assetInformation); }
        if (historical                   !== undefined) { this.setHistorical(historical); }
        if (isAutoScale                  !== undefined) { this.setAutoScale(isAutoScale); }
        if (isHighestLowestMarkerEnabled !== undefined) { this.toggleHighestLowestMarker(isHighestLowestMarkerEnabled); }
    }

    saveSetting() {
        if (this.onSettingsChange) {
            this.onSettingsChange({
                assetInformation            : this.assetInformation,
                countdown                   : this.countdown,
                historical                  : this.historical,
                language                    : this.language.key,
                position                    : this.position,
                isAutoScale                 : this.isAutoScale,
                isHighestLowestMarkerEnabled: this.isHighestLowestMarkerEnabled,
                theme                       : this.theme,
            });
        }
    }

    @action.bound setView(view) {
        this.view = view || '';
    }

    @action.bound updateActiveLanguage(activeLanguages) {
        this.setView(''); // return the view back to chart setting list

        if (activeLanguages) {
            this.languages = activeLanguages
                .map(lngKey => languageList.find(lng => lng.key.toUpperCase() === lngKey) || null)
                .filter(x => x);
        } else this.languages = languageList;

        // set default language as the first item of active languages or Eng
        this.defaultLanguage = this.languages[0];

        if (
            (this.language && !this.languages.find(x => x.key === this.language.key))
            || !this.language
        ) {
            this.setLanguage(this.languages[0].key);
        }
    }

    @action.bound setLanguage(lng) {
        if (!this.languages.length) { return; }
        if (this.language && lng === this.language.key) { return; }
        this.language = this.languages.find(item => item.key === lng) || this.defaultLanguage;
        t.setLanguage(this.language.key);
        logEvent(LogCategories.ChartControl, LogActions.ChartSetting, `Change language to ${this.language.key}`);
        this.saveSetting();
    }

    @action.bound setTheme(theme) {
        if (this.theme === theme) { return; }
        this.theme = theme;

        if (this.context) {
            this.mainStore.state.setChartTheme(theme);
            this.mainStore.crosshair.setFloatPriceLabelStyle(theme);
        }
        logEvent(LogCategories.ChartControl, LogActions.ChartSetting, `Change theme to ${theme}`);
        this.saveSetting();
    }

    @action.bound setPosition(value) {
        if (this.position === value) { return; }
        this.position = value;
        if (this.context) { this.stx.clearStyles(); }
        logEvent(LogCategories.ChartControl, LogActions.ChartSetting, 'Change Position');
        this.saveSetting();

        /**
        * Chart should fix its height & width after the position changed,
        * for that purpose we stay some 10 ms so that position varaible update
        * on chart context then ask chart to update itself hight & width
        */
        setTimeout(() => {
            this.mainStore.chart.resizeScreen();
        }, 10);
        this.menu.setOpen(false);
    }

    @action.bound setAssetInformation(value) {
        if (this.assetInformation === value) { return; }
        this.assetInformation = value;
        logEvent(LogCategories.ChartControl, LogActions.ChartSetting, `${value ? 'Show'  : 'Hide'} Asset Information`);
        this.saveSetting();
    }

    @action.bound showCountdown(value) {
        if (this.countdown === value) { return; }
        this.countdown = value;
        logEvent(LogCategories.ChartControl, LogActions.ChartSetting, `${value ? 'Show'  : 'Hide'} Countdown`);

        this.saveSetting();
    }

    @action.bound setHistorical(value) {
        if (this.historical === value) { return; }
        this.historical = value;
        this.isHighestLowestMarkerEnabled = !value;
        this.saveSetting();
        /**
        * Chart should fix its height & width after the position changed,
        * for that purpose we stay some 10 ms so that position varaible update
        * on chart context then ask chart to update itself hight & width
        */
        setTimeout(() => {
            this.mainStore.chart.resizeScreen();
        }, 10);
        this.menu.setOpen(false);
    }

    @action.bound setAutoScale(value) {
        if (this.isAutoScale === value) { return; }

        this.isAutoScale = value;
        logEvent(LogCategories.ChartControl, LogActions.ChartSetting, ` Change AutoScale to ${value}`);

        this.saveSetting();
    }

    @action.bound toggleHighestLowestMarker(value) {
        if (this.isHighestLowestMarkerEnabled === value) { return; }

        this.isHighestLowestMarkerEnabled = value;
        logEvent(LogCategories.ChartControl, LogActions.ChartSetting, ` ${value ? 'Show' : 'Hide'} HighestLowestMarker.`);

        this.saveSetting();
    }
}
