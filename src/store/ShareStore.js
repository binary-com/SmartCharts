import { observable, action, reaction, computed, autorunAsync, when } from 'mobx';
import MenuStore from './MenuStore';
import { downloadFileInBrowser, findAncestor } from './utils';
import html2canvas from 'html2canvas';

export default class ShareStore {
    constructor(mainStore) {
        this.mainStore = mainStore;
        this.menu = new MenuStore({getContext: () => this.mainStore.chart.context});

        when(() => this.context, this.onContextReady);
        reaction(() => this.menu.open, this.refereshShareLink);
    }

    get context() { return this.mainStore.chart.context; }
    get stx() { return this.context.stx; }

    @computed get timeUnit() { return this.mainStore.timeperiod.timeUnit; }
    @computed get timeperiodDisplay() { return this.mainStore.timeperiod.display; }
    @computed get marketDisplayName() {
        return this.mainStore.chart.currentActiveSymbol.market_display_name;
    }
    @computed get decimalPlaces() {
        return this.mainStore.chart.currentActiveSymbol.decimal_places;
    }

    @observable copyTooltip = 'Copy to clipboard';
    @action.bound resetCopyTooltip() { this.copyTooltip = 'Copy to clipboard'; }
    onCopyDone = (successful) => {
        this.copyTooltip = successful ? 'Copied!' : 'Failed!';
    }
    bitlyUrl = 'https://api-ssl.bitly.com/v3/shorten';
    accessToken = '837c0c4f99fcfbaca55ef9073726ef1f6a5c9349';
    @observable loading = false;
    @observable urlGenerated = false;
    @observable shortUrlFailed = false;


    @observable shareLink = '';
    refereshShareLink = () => {
        let self = this;
        if(!this.context || !this.menu.dialog.open ) { return; }

        const layoutData = this.stx.exportLayout(true);
        layoutData.favorites = [];

        const json = JSON.stringify(layoutData),
            fixedEncodeURIComponent = function (str) {
                return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
                    return `%${c.charCodeAt(0).toString(16)}`;
                });
            };

        const origin = window.location.href;
        this.shareLink = fixedEncodeURIComponent(`${origin}#${json}`);

        this.shortUrlFailed = false;
        this.loading = true;

        fetch(`${this.bitlyUrl}?access_token=${this.accessToken}&longUrl=${this.shareLink}`)
            .then( response => {
                return response.json();
            })
            .then( response =>  {
                if (response.status_code == 200 ) {
                    self.shareLink = response.data.url;
                    self.urlGenerated = true;
                }else{
                    self.shortUrlFailed = true;
                    self.urlGenerated = false;
                }
                self.loading = false;
            })
            .catch(error => {
                self.loading = false;
                self.urlGenerated = false;
            });

    }
    @action.bound downloadPNG() {
        this.menu.setOpen(false);
        const root = findAncestor(this.stx.container, 'ciq-chart-area');
        html2canvas(root).then((canvas) => {
            const content = canvas.toDataURL("image/png");
            downloadFileInBrowser(
                `${new Date().toUTCString()}.png`,
                content,
                'image/png;',
            );
        });
    }
    @action.bound downloadCSV() {
        const isTick = this.timeUnit === 'tick';
        const header = `Date,Time,${isTick ? this.marketDisplayName : 'Open,High,Low,Close'}`;
        const lines = [header];
        this.stx.masterData.forEach(row => {
            const {DT, Open, High, Low, Close} = row;

            const year = DT.getUTCFullYear();
            const month = DT.getUTCMonth() + 1; //months from 1-12
            const day = DT.getUTCDate();
            const hours = DT.getUTCHours();
            const minutes = DT.getUTCMinutes();
            // const seconds = DT.getUTCSeconds();

            const date = `${year}-${month > 9 ? month : `0${month}`}-${day > 9 ? day : `0${day}`}`;
            const time = `${hours > 9 ? hours : `0${hours}`}:${minutes > 9 ? minutes : `0${minutes}`}`;
            if(isTick && Close) { lines.push(`${date},${time},${Close}`); }
            if(!isTick && Open && High && Low && Close) {
                lines.push([
                    date,
                    time,
                    Open.toFixed(this.decimalPlaces),
                    High.toFixed(this.decimalPlaces),
                    Low.toFixed(this.decimalPlaces),
                    Close.toFixed(this.decimalPlaces)
                ].join(','));
            }
        });

        downloadFileInBrowser(
            `${this.marketDisplayName} (${this.timeperiodDisplay}).csv`,
            lines.join('\n'),
            'text/csv;charset=utf-8;',
        );
    }

    copyWithExecCommand() {
        this.inputRef.focus();
        this.inputRef.select();

        let successful = false;
        try {
            successful = document.execCommand('copy');
        } catch (e) { }
        return successful;
    }
    copyWithNavigator() {
        const text = this.shareLink;
        return navigator.clipboard.writeText(text)
            .then(() => true)
            .catch(() => false);
    }


    @action.bound copyToClipboard() {
        if(!navigator.clipboard) {
            this.onCopyDone(this.copyWithExecCommand());
        } else {
            this.copyWithNavigator().then(this.onCopyDone);
        }
    }

    onInputRef = (ref) => this.inputRef = ref;
    onContextReady = () => { };
}

