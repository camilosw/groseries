import type { GroceryItem, PurchasedSortMode } from '../types';

export interface GroceryState {
  items: GroceryItem[];
  sortMode: PurchasedSortMode;
}

const STORAGE_KEY = 'groceries-app-state';

export function saveState(state: GroceryState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore write errors
  }
}

export function loadState(): GroceryState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.items)) return null;
    const items: GroceryItem[] = parsed.items.map((item: GroceryItem) => ({
      ...item,
      quantity: item.quantity ?? 1,
    }));
    return { ...parsed, items } as GroceryState;
  } catch {
    return null;
  }
}
