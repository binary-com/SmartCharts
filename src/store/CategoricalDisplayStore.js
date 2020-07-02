import React            from 'react';
import { action, observable, computed, reaction } from 'mobx';
import { connect }      from './Connect';
import SearchInput      from '../components/SearchInput.jsx';
import { NormalItem, ActiveItem, ResultsPanel, FilterPanel } from '../components/categoricaldisplay';
import { cloneCategories, cloneCategory } from '../utils';

export default class CategoricalDisplayStore {
    constructor({
        getCategoricalItems,
        onSelectItem,
        getIsShown,
        getActiveCategory,
        activeOptions,
        placeholderText,
        favoritesId,
        mainStore,
        id,
        getCurrentActiveCategory,
        getCurrentActiveSubCategory,
        searchInputClassName,
    }) {
        reaction(() => (getIsShown && getIsShown() && this.scrollPanel), () => {
            if (getIsShown() && this.scrollPanel) {
                const activeItemCount = getActiveCategory ? getActiveCategory().data.length : 0;
                this.focusedCategoryKey = null;
                this.activeCategoryKey = this.getCurrentActiveCategory ? this.getCurrentActiveCategory() : 'favorite';
                this.activeSubCategory = this.getCurrentActiveSubCategory ? this.getCurrentActiveSubCategory() : '';
                const el = this.categoryElements[this.activeCategoryKey];
                const activeSubCategoryClassName = this.id ? `.category-${this.activeCategoryKey} .${this.id}-subcategory-item-${this.activeSubCategory}` : `.category-${this.activeCategoryKey}  .subcategory-item-${this.activeSubCategory}`;
                const el_active_sub_category = this.scrollPanel.querySelector(activeSubCategoryClassName);
                this.activeHeadKey = this.activeCategoryKey || null;
                this.activeHeadTop = 0;
                this.pauseScrollSpy = true;
                this.isUserScrolling = false;

                if (activeItemCount) {
                    this.activeCategoryKey = 'active';
                    this.activeHeadKey = null;
                    this.scrollPanel.scrollTop = 0;
                } else if (el) {
                    this.scrollPanel.scrollTop = el.offsetTop;

                    if (el_active_sub_category) {
                        this.scrollPanel.scrollTop = (el.offsetTop + el_active_sub_category.offsetTop - 40);
                    }
                }
                setTimeout(() => { this.pauseScrollSpy = false; }, 20);

                if (!this.isInit) { this.init(); }
                if (!mainStore.chart.isMobile) {
                    setTimeout(() => {
                        this.searchInput.current.focus();
                    }, 0);
                }
            } else if (!getIsShown()) {
                this.scrollPanel = null;
            }
        }, {
            delay: 200,
        });
        this.getCategoricalItems = getCategoricalItems;
        this.onSelectItem = onSelectItem;
        this.getActiveCategory = getActiveCategory;
        this.favoritesId = favoritesId;
        this.id = id;
        this.categoryElements = {};
        this.mainStore = mainStore;
        this.getCurrentActiveCategory = getCurrentActiveCategory;
        this.getCurrentActiveSubCategory = getCurrentActiveSubCategory;
        this.isInit = false;
        this.searchInput = React.createRef();
        this.searchInputClassName = searchInputClassName;

        const normalItem = connect(() => ({
            favoritesId,
            id,
        }))(NormalItem);

        const activeItem = connect(() => ({
            activeOptions,
            favoritesId,
        }))(ActiveItem);

        const getItemType = (categoryId) => {
            if (categoryId === 'active' && (this.getActiveCategory !== undefined)) {
                return activeItem;
            }

            return normalItem;
        };

        this.ResultsPanel = connect(() => ({
            filteredItems: this.filteredItems,
            setCategoryElement: this.setCategoryElement,
            getItemType,
            activeHeadTop: this.activeHeadTop,
            activeHeadKey: this.activeHeadKey,
            activeHeadOffset: this.activeHeadOffset,
            handleTitleClick: this.handleTitleClick,
        }))(ResultsPanel);

        this.FilterPanel = connect(({ chart }) => ({
            isMobile: chart.isMobile,
            filteredItems: this.filteredItems,
            handleFilterClick: this.handleFilterClick,
            activeCategoryKey: this.activeCategoryKey,
            focusedCategoryKey: this.focusedCategoryKey,
        }))(FilterPanel);

        this.SearchInput = connect(() => ({
            placeholder: placeholderText,
            value: this.filterText,
            onChange: this.setFilterText,
            searchInput: this.searchInput,
            searchInputClassName: this.searchInputClassName,
        }))(SearchInput);
    }

    @observable isShown = false;
    @observable scrollPanel;
    @observable filterText = '';
    @observable activeCategoryKey = '';
    @observable focusedCategoryKey = null;
    @observable isScrollingDown = false;
    scrollTop = undefined;
    @observable activeHeadKey = undefined;
    @observable activeHeadTop = 0;
    @observable activeHeadOffset = undefined;
    isUserScrolling = true;
    lastFilteredItems = [];
    activeCategories = [];

    get chart() { return this.mainStore.chart; }

    get context() { return this.chart.context; }

    get height() {
        return this.chart.chartContainerHeight - (this.chart.isMobile ? 0 : 120);
    }

    @action.bound updateScrollSpy() {
        if (this.pauseScrollSpy || !this.scrollPanel) { return; }
        if (this.filteredItems.length === 0) { return; }

        // hits: 40px for title hight + 4px for content bottom border
        const categoryTitleHeight = 44;
        const scrollPanelTop = this.scrollPanel.getBoundingClientRect().top;
        let activeHeadTop = 0;
        let activeMenuId = null;

        for (const category of this.filteredItems) {
            const el = this.categoryElements[category.categoryId];

            if (!el) { return; }

            const r = el.getBoundingClientRect();
            const top = r.top - scrollPanelTop;
            if (top < 0) {
                activeMenuId = category.categoryId;
                const categorySwitchPoint = r.height + top - categoryTitleHeight;
                activeHeadTop = categorySwitchPoint < 0 ? categorySwitchPoint : 0;
            }
        }

        const scrollTop = this.scrollPanel.getBoundingClientRect().top;
        if (this.scrollTop > scrollTop) {
            this.scrollUp();
        } else {
            this.scrollDown();
        }

        const offsetTop = this.scrollPanel.getBoundingClientRect().top - window.scrollY;
        this.activeHeadOffset = (this.chart.isMobile ? offsetTop : 0);
        this.scrollTop = scrollTop;
        this.focusedCategoryKey = activeMenuId || this.filteredItems[0].categoryId;
        this.activeHeadTop = activeHeadTop;
        this.activeHeadKey = this.scrollTop === 0 ? null : this.focusedCategoryKey;
    }

    @action.bound scrollUp() {
        this.isScrollingDown = false;
    }

    @action.bound scrollDown() {
        // This only affects when scrolling by mouse not by code
        this.isScrollingDown = this.isUserScrolling;
        this.isUserScrolling = true;
    }

    @action.bound init() {
        this.isInit = true;
        // Select first non-empty category:
        if (this.activeCategoryKey === '' && this.filteredItems.length > 0) {
            for (const category of this.filteredItems) {
                const el = this.categoryElements[category.categoryId];
                if (el) {
                    this.activeCategoryKey = category.categoryId;
                    break;
                }
            }
        }
    }

    @computed get favoritesCategory()  {
        this.pauseScrollSpy = true;
        const favoritesCategory = {
            categoryName: t.translate('Favorites'),
            categoryId: 'favorite',
            hasSubcategory: false,
            active: true,
            emptyDescription: t.translate('There are no favorites yet.'),
            data: Object.keys(this.mainStore.favorites.favoritesMap[this.favoritesId]) || [],
        };
        setTimeout(() => { this.pauseScrollSpy = false; }, 20);
        return favoritesCategory;
    }

    @computed get filteredItems() {
        let filteredItems = cloneCategories(this.getCategoricalItems());
        const activeItmes = this.activeCategories.length
            ? this.activeCategories
            : [(this.getCurrentActiveCategory ? this.getCurrentActiveCategory() : 'favorite')];

        for (const item of filteredItems) {
            if (activeItmes.includes(item.categoryId)) {
                item.active = true;
            }
        }

        if (this.favoritesId) {
            const favsCategory = { ...this.favoritesCategory };
            const findFavItem = (category) => {
                const foundItems = [];
                if (category.hasSubcategory) {
                    category.data.forEach((subcategory) => {
                        const foundSubItems = findFavItem(subcategory);
                        foundItems.push(...foundSubItems);
                    });
                } else {
                    favsCategory.data.forEach((favItem) => {
                        if (typeof favItem === 'string') {
                            const itemObj = category.data.find(item => item.itemId === favItem);
                            if (itemObj) {
                                foundItems.push(itemObj);
                            }
                        }
                    });
                }
                return foundItems;
            };

            const favsCategoryItem = favsCategory.data
                .filter(favItem => (typeof favItem !== 'string'));

            filteredItems.forEach((category) => {
                const foundItems = findFavItem(category);
                favsCategoryItem.push(...foundItems);
            });

            favsCategory.data = favsCategoryItem.filter(favItem => favItem);
            filteredItems.unshift(favsCategory);
        }

        if (this.getActiveCategory) {
            const activeCategory = cloneCategory(this.getActiveCategory());
            filteredItems.unshift(activeCategory);
        }

        if (this.filterText === '') {
            this.lastFilteredItems = filteredItems;
            return filteredItems;
        }

        let searchHasResult = false;
        const queries = this.filterText.split(' ').filter(x => x !== '').map(b => b.toLowerCase().trim());
        // regex to check all separate words by comma, should exist in the string
        const hasSearchString = text => queries.reduce((a, b) => text.toLowerCase().includes(b) && a, true);
        const filterCategory = (c) => {
            c.data = c.data.filter(item => hasSearchString(item.display || (typeof item.dataObject === 'object' && item.dataObject.symbol)));
            if (c.data.length) { searchHasResult = true; }
        };

        for (const category of filteredItems) {
            category.active = true;
            if (category.hasSubcategory) {
                for (const subcategory of category.data) {
                    filterCategory(subcategory);
                }
            } else {
                filterCategory(category);
            }
        }


        if (!searchHasResult) {
            filteredItems = this.lastFilteredItems;
        }

        if (!this.pauseScrollSpy) {
            this.lastFilteredItems = filteredItems;
        }
        return filteredItems;
    }

    @action.bound setCategoryElement(element, id) {
        this.categoryElements[id] = element;
    }

    @action.bound setFilterText(filterText) {
        this.filterText = filterText;
        this.isUserScrolling = false;
        setTimeout(() => {
            this.updateScrollSpy();
        }, 0);
    }

    @action.bound handleFilterClick(categoryId) {
        const el = this.categoryElements[categoryId];

        if (el) {
            // TODO: Scroll animation
            this.pauseScrollSpy = true;
            this.isUserScrolling = false;
            if (this.chart.isMobile) {
                this.scrollPanel.scroll({
                    top: el.offsetTop - 40,
                    left: 0,
                    behavior: 'smooth',
                });
            } else {
                this.scrollPanel.scrollTop = el.offsetTop;
            }
            this.focusedCategoryKey = categoryId;
            this.activeHeadKey = null;
            // scrollTop takes some time to take affect, so we need
            // a slight delay before enabling the scroll spy again
            setTimeout(() => { this.pauseScrollSpy = false; }, 20);
        }
    }

    @action.bound setScrollPanel(element) {
        if (!this.scrollPanel) this.scrollPanel = element;
    }

    @action.bound handleTitleClick(categoryId) {
        this.activeCategories = [];
        for (const item of this.filteredItems) {
            if (item.categoryId === categoryId) {
                item.active = !item.active;

                if (item.active) {
                    setTimeout(() => this.handleFilterClick(categoryId), 250);
                }
            }

            if (item.active && item.categoryId !== 'favorite') {
                this.activeCategories.push(item.categoryId);
            }
        }

        this.activeHeadTop = null;
        setTimeout(() => this.updateScrollSpy(), 0);
    }

    connect = connect(() => ({
        filteredItems: this.filteredItems,
        updateScrollSpy: this.updateScrollSpy,
        setScrollPanel: this.setScrollPanel,
        isScrollingDown: this.isScrollingDown,
        handleTitleClick: this.handleTitleClick,
        scrollUp: this.scrollUp,
        scrollDown: this.scrollDown,
        onSelectItem: this.onSelectItem,
        ResultsPanel: this.ResultsPanel,
        FilterPanel: this.FilterPanel,
        SearchInput: this.SearchInput,
        height: this.height,
    }))
}
