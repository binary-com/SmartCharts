import EventEmitter from 'event-emitter-es6';
import { action, observable, makeObservable } from 'mobx';
import { createObjectFromLocalStorage, saveToLocalStorage } from '../utils';

function loadFavorites() {
    const local = createObjectFromLocalStorage('cq-favorites');
    if (!local) {
        return;
    }

    const favorites: Record<string, Record<string, boolean>> = {};
    for (const categoryName in local) {
        const category: Record<string, boolean> = {};
        for (const id of local[categoryName]) {
            category[id] = true;
        }
        favorites[categoryName] = category;
    }

    return favorites;
}

class FavoriteStore {
    static get EVENT_FAVORITES_UPDATE() {
        return 'EVENT_FAVORITES_UPDATE';
    }

    favoritesMap = loadFavorites() || {
        indicators: {},
        'chartTitle&Comparison': {},
    };

    static instance: FavoriteStore;

    _emitter: EventEmitter;

    static getInstance() {
        if (!FavoriteStore.instance) {
            FavoriteStore.instance = new FavoriteStore();
        }

        return FavoriteStore.instance;
    }

    constructor() {
        makeObservable(this, {
            favoritesMap: observable,
            isFavorite: action.bound,
            toggleFavorite: action.bound,
        });

        this._emitter = new EventEmitter({ emitDelay: 0 });
    }

    onFavoriteUpdate(callback: EventListener) {
        this._emitter.on(FavoriteStore.EVENT_FAVORITES_UPDATE, callback);
    }

    offFavoriteUpdate(callback: EventListener) {
        this._emitter.off(FavoriteStore.EVENT_FAVORITES_UPDATE, callback);
    }

    isFavorite(category: string, id: string) {
        return id in this.favoritesMap[category];
    }

    toggleFavorite(category: string, id: string) {
        const cat = this.favoritesMap[category];
        if (cat[id]) {
            delete cat[id];
        } else {
            cat[id] = true;
        }
        this._emitter.emit(FavoriteStore.EVENT_FAVORITES_UPDATE, { category, id, value: cat[id] || false });
        // this.favoritesMap = { ...this.favoritesMap }; // force observable to update
        this.saveFavorites();
    }

    saveFavorites() {
        const favorites: Record<string, string[]> = {};
        for (const categoryName in this.favoritesMap) {
            const category = [];
            for (const id in this.favoritesMap[categoryName]) {
                category.push(id);
            }
            favorites[categoryName] = category;
        }
        saveToLocalStorage('cq-favorites', favorites);
    }
}

export default FavoriteStore;
