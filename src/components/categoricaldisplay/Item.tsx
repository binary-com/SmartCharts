import React from 'react';
import { ItemIconMap } from '../Icons';
import Favorite from '../Favorite';
import { TProcessedSymbolItem, TSubCategoryDataItem } from '../../binaryapi/ActiveSymbols';

export type TBaseItemProps = {
    item: TSubCategoryDataItem;
    favoritesId: string;
};

export type TActiveItemProps = TBaseItemProps;

export type TNormalItemProps = TBaseItemProps & {
    onSelectItem?: (item: TProcessedSymbolItem) => void;
};

const Icon = React.memo(({ id }: { id: string }) => {
    if (!id || !ItemIconMap[id as keyof typeof ItemIconMap]) {
        return null;
    }
    const ItemIcon = ItemIconMap[id as keyof typeof ItemIconMap];
    return <ItemIcon className={`ic-${id}`} />;
});

const ItemName = React.memo(({ item: { itemId, display } }: { item: TSubCategoryDataItem }) => (
    <div className='sc-mcd__item__name'>
        <Icon id={itemId} />
        {display}
    </div>
));

const ItemDetail = React.memo(
    ({ favoritesId, item: { dataObject, itemId } }: { favoritesId: string; item: TSubCategoryDataItem }) => (
        <div className='sc-mcd__item__detail'>
            {dataObject && (dataObject.exchange_is_open === undefined || dataObject.exchange_is_open) ? (
                ''
            ) : (
                <span className='closed-market'>{t.translate('CLOSED')}</span>
            )}
            <Favorite category={favoritesId} id={itemId} />
        </div>
    )
);

const NormalItemComponent: React.FC<TNormalItemProps> = ({ onSelectItem, item, favoritesId }) => (
    <div
        className={`sc-mcd__item sc-mcd__item--${item.itemId} ${item.selected ? 'sc-mcd__item--selected ' : ''}`}
        onClick={() => item.enabled && onSelectItem?.(item.dataObject)}
    >
        <ItemName item={item} />
        <ItemDetail item={item} favoritesId={favoritesId} />
    </div>
);

export const NormalItem = React.memo(NormalItemComponent);

export const ActiveItem: React.FC<TActiveItemProps> = ({ item, favoritesId }) => (
    <div className='sc-active-item'>
        <ItemName item={item} />
        <div className='sc-mcd__item__detail'>
            <Favorite category={favoritesId} id={item.itemId} />
        </div>
    </div>
);
