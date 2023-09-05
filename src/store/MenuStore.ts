import { action, computed, observable, reaction, makeObservable } from 'mobx';
import { ChartTypes, Intervals, STATE } from 'src/Constant';
import { getTimeIntervalName } from 'src/utils';
import MainStore from '.';
import Context from '../components/ui/Context';
import DialogStore from './DialogStore';

export default class MenuStore {
    dialogStore: DialogStore;
    mainStore: MainStore;
    constructor(mainStore: MainStore, options: { route: string }) {
        makeObservable(this, {
            dialogStatus: observable,
            route: observable,
            open: computed,
            setOpen: action.bound,
            onTitleClick: action.bound,
            handleDialogStatus: action.bound,
            handleCloseDialog: action.bound,
        });

        this.mainStore = mainStore;
        this.dialogStore = new DialogStore(mainStore);
        reaction(
            () => this.open,
            () => this.blurInput()
        );
        if (options && options.route) {
            this.route = options.route;
        }
    }
    get context(): Context | null {
        return this.mainStore.chart.context;
    }
    get routingStore() {
        return this.mainStore.routing;
    }
    dialogStatus = false;
    route = '';
    get open() {
        return this.dialogStore.open;
    }
    setOpen(val: boolean) {
        this.dialogStore.setOpen(val);
        /**
         *  Update the url hash by considering the dialog `route` and `open`
         */
        this.routingStore.updateRoute(this.route, val);
    }
    blurInput() {
        const stx: Context['stx'] = this.context?.stx;
        setTimeout(this.handleDialogStatus, 300);
        if (this.open === false) {
            (document.activeElement as HTMLElement).blur();
            stx.modalEnd();
        } else {
            stx.modalBegin();
        }
        stx.allowZoom = !this.open;
        if (!this.open) {
            this.mainStore.state.setEnableScroll();
        } else {
            this.mainStore.state.setDisableScroll();
        }
    }
    onTitleClick(e: React.MouseEvent) {
        if (e) {
            e.stopPropagation();
        }
        this.setOpen(!this.open);
    }
    handleDialogStatus() {
        if (this.route === 'chart-mode') {
            const chart_type_name = ChartTypes.find(type => type.id === this.mainStore.state.chartType)?.text ?? '';
            this.mainStore.state.stateChange(STATE.CHART_MODE_TOGGLE, {
                is_open: this.open,
                chart_type_name:
                    this.mainStore.state.chartType === 'colored_bar' ? chart_type_name : chart_type_name.toLowerCase(),
                time_interval_name: getTimeIntervalName(this.mainStore.state.granularity, Intervals),
            });
        } else if (this.route === 'chart-title') {
            this.mainStore.state.stateChange(STATE.MARKETS_LIST_TOGGLE, {
                is_open: this.open,
                market_type_name: this.mainStore.chart.currentActiveSymbol?.name,
            });
        } else if (this.route === 'indicators') {
            this.mainStore.state.stateChange(STATE.INDICATORS_MODAL_TOGGLE, {
                is_open: this.open,
            });
        }
        this.dialogStatus = this.open;
    }
    handleCloseDialog() {
        this.dialogStatus = false;
        setTimeout(() => this.setOpen(false), 300);
    }
}
