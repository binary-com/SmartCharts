import { observable, action, computed } from 'mobx';
import { connect } from './Connect';
import Dialog from '../components/Dialog.jsx';
import MenuStore from './MenuStore';

export default class SettingsDialogStore {
    @observable items = []; // [{id: '', title: '', value: ''}]
    @observable title = '';
    @observable description = '';

    @observable activeTab = 'settings'; // 'settings' | 'description'
    @computed get showTabs() { return !!this.description; }

    constructor({
        mainStore, getContext, onChanged,
    }) {
        this.mainStore = mainStore;
        this.getContext = getContext;
        this.onChanged = onChanged;
        this.menu = new MenuStore(mainStore, { route:'indicator-setting' });
        this.Dialog = this.menu.dialog.connect(Dialog);
    }

    get context() { return this.mainStore.chart.context; }
    get stx() { return this.context.stx; }
    get theme() { return this.mainStore.chartSetting.theme; }

    @computed get open() { return this.menu.open; }
    @action.bound setOpen(value) {
        return this.menu.setOpen(value);
    }

    @action.bound onResetClick() {
        const items = this.items.map(item => ({ ...item, value: item.defaultValue }));
        this.items = items;
        this.onChanged(items);
    }

    @action.bound onItemChange(id, newValue) {
        const item = this.items.find(x => x.id === id);
        if (item && item.value !== newValue) {
            item.value = newValue;
            this.items = this.items.slice(0); // force array update
            this.onChanged(this.items);
        }
    }

    connect = connect(() => ({
        items: this.items,
        title: this.title,
        description: this.description,
        showTabs: this.showTabs,
        setOpen: this.setOpen,
        onResetClick: this.onResetClick,
        onItemChange: this.onItemChange,
        Dialog: this.Dialog,
        open: this.open,
        theme: this.theme,
    }));
}
