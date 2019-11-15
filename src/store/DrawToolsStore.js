import { action, reaction, when } from 'mobx';
import MenuStore from './MenuStore';
import SettingsDialogStore from './SettingsDialogStore';
import Menu from '../components/Menu.jsx';
import SettingsDialog from '../components/SettingsDialog.jsx';
import { logEvent, LogCategories, LogActions } from  '../utils/ga';

// camelCase to spaces separated capitalized string.
const formatCamelCase = (s) => {
    const capitalized = s.charAt(0).toUpperCase() + s.slice(1);
    return capitalized.replace(/([a-z](?=[A-Z]))/g, '$1 ');
};

export default class DrawToolsStore {
    constructor(mainStore) {
        this.mainStore = mainStore;
        this.menu = new MenuStore(mainStore, { route: 'draw-tool' });
        this.DrawToolsMenu = this.menu.connect(Menu);
        this.settingsDialog = new SettingsDialogStore({
            mainStore,
            onDeleted: this.onDeleted,
            onChanged: this.onChanged,
        });
        this.DrawToolsSettingsDialog = this.settingsDialog.connect(SettingsDialog);

        when(() => this.context, this.onContextReady);
        reaction(() => this.menu.open, this.noTool);
    }

    get context() { return this.mainStore.chart.context; }

    get stx() { return this.context.stx; }

    activeDrawing = null;
    isContinuous = false;

    drawToolsItems = [];

    onContextReady = () => {
        document.addEventListener('keydown', this.closeOnEscape, false);
        this.stx.addEventListener('drawing', this.noTool);
        this.stx.prepend('deleteHighlighted', this.onDeleteHighlighted);
        this.drawToolsItems = [
            { id: 'annotation',  text: t.translate('Annotation') },
            { id: 'average',     text: t.translate('Average Line') },
            { id: 'callout',     text: t.translate('Callout') },
            { id: 'channel',     text: t.translate('Channel') },
            { id: 'continuous',  text: t.translate('Continuous') },
            { id: 'crossline',   text: t.translate('Crossline') },
            { id: 'freeform',    text: t.translate('Doodle') },
            { id: 'ellipse',     text: t.translate('Ellipse') },
            { id: 'retracement', text: t.translate('Fib Retracement') },
            { id: 'fibarc',      text: t.translate('Fib Arc') },
            { id: 'fibfan',      text: t.translate('Fib Fan') },
            { id: 'fibtimezone', text: t.translate('Fib Time Zone') },
            { id: 'gannfan',     text: t.translate('Gann Fan') },
            { id: 'gartley',     text: t.translate('Gartley') },
            { id: 'horizontal',  text: t.translate('Horizontal') },
            { id: 'line',        text: t.translate('Line') },
            { id: 'pitchfork',   text: t.translate('Pitchfork') },
            { id: 'quadrant',    text: t.translate('Quadrant Lines') },
            { id: 'ray',         text: t.translate('Ray') },
            { id: 'rectangle',   text: t.translate('Rectangle') },
            { id: 'regression',  text: t.translate('Regression Line') },
            { id: 'segment',     text: t.translate('Segment') },
            { id: 'arrow',       text: t.translate('Shape - Arrow') },
            { id: 'check',       text: t.translate('Shape - Check') },
            { id: 'xcross',      text: t.translate('Shape - Cross') },
            { id: 'focusarrow',  text: t.translate('Shape - Focus') },
            { id: 'heart',       text: t.translate('Shape - Heart') },
            { id: 'star',        text: t.translate('Shape - Star') },
            { id: 'speedarc',    text: t.translate('Speed Resistance Arc') },
            { id: 'speedline',   text: t.translate('Speed Resistance Line') },
            { id: 'timecycle',   text: t.translate('Time Cycle') },
            { id: 'tirone',      text: t.translate('Tirone Levels') },
            { id: 'vertical',    text: t.translate('Vertical') },
        ];
    };

    closeOnEscape = (e) => {
        const ESCAPE = 27;
        if (e.keyCode === ESCAPE) {
            this.stx.changeVectorType('');
        }
    };

    @action.bound onDeleteHighlighted(callRightClick) {
        for (const drawing of this.stx.drawingObjects) {
            if (callRightClick) {
                this.showDrawToolDialog(drawing);
                return true; // Override default behaviour; prevent ChartIQ from deleting the drawing
            }
        }
        return false;
    }

    showDrawToolDialog(drawing) {
        logEvent(LogCategories.ChartControl, LogActions.DrawTools, `Edit ${drawing.name}`);
        const dontDeleteMe = drawing.abort(); // eslint-disable-line no-unused-vars
        const parameters = CIQ.Drawing.getDrawingParameters(this.stx, drawing.name);

        const typeMap = {
            color: 'colorpicker',
            fillColor: 'colorpicker',
            pattern: 'pattern',
            axisLabel: 'switch',
            font: 'font',
            lineWidth: 'none',
        };
        this.settingsDialog.items = Object.keys(parameters)
            .filter(key => !( // Remove pattern option from Fibonacci tools
                (drawing.name.startsWith('fib') || drawing.name === 'retracement')
                && key === 'pattern'))
            .map(key => ({
                id: key,
                title: formatCamelCase(key),
                value: drawing[key],
                defaultValue: parameters[key],
                type: typeMap[key],
            }));
        this.activeDrawing = drawing;
        this.activeDrawing.highlighted = false;
        this.settingsDialog.title = formatCamelCase(drawing.name);
        this.settingsDialog.setOpen(true);
    }

    noTool = () => {
        const count = this.stx.drawingObjects.length;
        if ((this.menu.open && this.context) || (!this.isContinuous && this._pervDrawingObjectCount !== count)) {
            this.stx.changeVectorType('');
        }
        this._pervDrawingObjectCount = count;
    };

    @action.bound clearAll() {
        logEvent(LogCategories.ChartControl, LogActions.DrawTools, 'Clear All');
        this.stx.clearDrawings();
    }

    @action.bound selectTool(id) {
        this.isContinuous = false;
        logEvent(LogCategories.ChartControl, LogActions.DrawTools, `Add ${id}`);
        const stx = this.context.stx;
        stx.clearMeasure(); // TODO remove this line
        stx.changeVectorType(id);
        if (id === 'continuous') {
            this.isContinuous = true;
        }
        this.menu.setOpen(false);
        // let drawingParameters = CIQ.Drawing.getDrawingParameters(stx, id);
    }

    @action.bound onChanged(items) {
        for (const item of items) {
            this.activeDrawing[item.id] = item.value;
        }
        this.activeDrawing.highlighted = false;
        this.activeDrawing.adjust();
        this.mainStore.state.saveDrawings();
    }

    @action.bound onDeleted() {
        logEvent(LogCategories.ChartControl, LogActions.DrawTools, `Remove ${this.activeDrawing.name}`);
        this.stx.removeDrawing(this.activeDrawing);
        this.activeDrawing = null;
    }
}
