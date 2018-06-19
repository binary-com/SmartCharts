import { observable } from 'mobx';
import TimeperiodStore from './TimeperiodStore';
import ChartStore from './ChartStore';
import ChartTypeStore from './ChartTypeStore';
import StudyLegendStore from './StudyLegendStore';
import ComparisonStore from './ComparisonStore';
import DrawToolsStore from './DrawToolsStore';
import ChartTitleStore from './ChartTitleStore';
import AssetInformationStore from './AssetInformationStore';
import ComparisonListStore from './ComparisonListStore';
import NotificationStore from './NotificationStore';
import ViewStore from './ViewStore';
import CrosshairStore from './CrosshairStore';
import ShareStore from './ShareStore';
import ChartPropsStore from './ChartPropsStore';
import LoaderStore from './LoaderStore';
import FavoriteSessionStore from './FavoriteSessionStore';
import ChartSizeStore from './ChartSizeStore';

export default class MainStore {
    @observable favoriteSessionStore = new FavoriteSessionStore();
    @observable chart = new ChartStore(this);
    @observable chartType = new ChartTypeStore(this);
    @observable studies = new StudyLegendStore(this);
    @observable comparison = new ComparisonStore(this);
    @observable drawTools = new DrawToolsStore(this);
    @observable chartTitle = new ChartTitleStore(this);
    @observable timeperiod = new TimeperiodStore(this);
    @observable assetInformation = new AssetInformationStore(this);
    @observable comparisonList = new ComparisonListStore(this);
    @observable notification = new NotificationStore(this);
    @observable view = new ViewStore(this);
    @observable crosshair = new CrosshairStore(this);
    @observable share = new ShareStore(this);
    @observable chartProps = new ChartPropsStore(this);
    @observable loader = new LoaderStore();
    @observable chartSize = new ChartSizeStore(this);
}
