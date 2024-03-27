import { computed, action, observable, makeObservable } from 'mobx';
import MainStore from '.';
import MenuStore from './MenuStore';

export default class IndicatorPredictionDialogStore {
    dialogPortalNodeId?: string;
    mainStore: MainStore;
    menuStore: MenuStore;
    scrollPanel?: HTMLElement;
    cancelCallback?: () => void;

    constructor({ mainStore }: { mainStore: MainStore }) {
        makeObservable(this, {
            dialogPortalNodeId: observable,
            open: computed,
            cancelCallback: observable,
            setOpen: action.bound,
            setCancel: action.bound,
            handleCancel: action.bound,
            handleContinue: action.bound,
        });

        this.mainStore = mainStore;
        this.menuStore = new MenuStore(mainStore, { route: 'indicator-setting' });
    }

    get open() {
        return this.menuStore.open;
    }

    setOpen(value: boolean) {
        if (value && this.scrollPanel) {
            this.scrollPanel.scrollTop = 0;
        }
        return this.menuStore.setOpen(value);
    }

    handleCancel() {
        if (this.cancelCallback) {
            this.cancelCallback();
        }
        this.setOpen(false);
        this.cancelCallback= () => false;
    }

    setCancel(callback: () => void) {
        this.cancelCallback = callback;
    }

    handleContinue() {
        this.mainStore.timeperiod.setGranularity(0);
        this.mainStore.studies.deletePredictionStudies();
        this.mainStore.studies.cleanupPredictionIndicator();
        setTimeout(() => {
            this.setOpen(false);
        }, 100);
    }
}
