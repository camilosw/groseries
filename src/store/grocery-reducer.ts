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
  | { type: 'REMOVE_FROM_BUY'; id: string }
  | { type: 'REORDER'; activeId: string; overId: string }
  | { type: 'RENAME_ITEM'; id: string; name: string }
  | { type: 'SET_QUANTITY'; id: string; quantity: number };

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
                quantity: 1,
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
        quantity: 1,
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
    case 'REMOVE_FROM_BUY': {
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, bought: true } : item,
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
    case 'RENAME_ITEM': {
      const trimmed = action.name.trim();
      if (!trimmed) return state;
      const duplicate = state.items.some(
        (item) =>
          item.id !== action.id &&
          item.name.toLowerCase() === trimmed.toLowerCase(),
      );
      if (duplicate) return state;
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, name: trimmed } : item,
        ),
      };
    }
    case 'SET_QUANTITY': {
      const quantity = Math.max(1, action.quantity);
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, quantity } : item,
        ),
      };
    }
    default:
      return state;
  }
}
