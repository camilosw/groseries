import type { GroceryItem, PurchasedSortMode } from '../types';
import type { GroceryState } from './storage';
import { pruneHistory } from '../utils/frequency';

export type GroceryAction =
  | { type: 'CHECK_ITEM'; id: string }
  | { type: 'UNCHECK_ITEM'; id: string }
  | { type: 'DELETE_ITEM'; id: string }
  | { type: 'SET_SORT_MODE'; mode: PurchasedSortMode }
  | { type: 'CREATE_AND_ADD'; name: string }
  | { type: 'ADD_TO_BUY'; id: string }
  | { type: 'REORDER'; activeId: string; overId: string };

export function groceryReducer(
  state: GroceryState,
  action: GroceryAction,
): GroceryState {
  switch (action.type) {
    case 'CHECK_ITEM': {
      const now = Date.now();
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id
            ? {
                ...item,
                bought: true,
                purchaseHistory: pruneHistory([...item.purchaseHistory, now]),
              }
            : item,
        ),
      };
    }
    case 'UNCHECK_ITEM': {
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, bought: false } : item,
        ),
      };
    }
    case 'DELETE_ITEM': {
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.id),
      };
    }
    case 'SET_SORT_MODE': {
      return { ...state, sortMode: action.mode };
    }
    case 'CREATE_AND_ADD': {
      const maxOrder = state.items.reduce(
        (max, item) => Math.max(max, item.purchaseOrder),
        -1,
      );
      const newItem: GroceryItem = {
        id: crypto.randomUUID(),
        name: action.name.trim(),
        purchaseHistory: [],
        purchaseOrder: maxOrder + 1,
        bought: false,
      };
      return { ...state, items: [...state.items, newItem] };
    }
    case 'ADD_TO_BUY': {
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, bought: false } : item,
        ),
      };
    }
    case 'REORDER': {
      const sorted = [...state.items].sort(
        (a, b) => a.purchaseOrder - b.purchaseOrder,
      );
      const activeIndex = sorted.findIndex(
        (item) => item.id === action.activeId,
      );
      const overIndex = sorted.findIndex((item) => item.id === action.overId);
      if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex)
        return state;
      const [moved] = sorted.splice(activeIndex, 1);
      sorted.splice(overIndex, 0, moved);
      const reordered = sorted.map((item, index) => ({
        ...item,
        purchaseOrder: index,
      }));
      return { ...state, items: reordered };
    }
    default:
      return state;
  }
}
