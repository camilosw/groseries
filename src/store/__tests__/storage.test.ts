import { describe, it, expect, beforeEach } from 'vitest';
import { saveState, loadState } from '../storage';
import type { GroceryState } from '../storage';

const mockState: GroceryState = {
  items: [
    {
      id: '1',
      name: 'Milk',
      purchaseHistory: [],
      purchaseOrder: 0,
      bought: false,
      quantity: 1,
    },
  ],
  sortMode: 'frequency',
};

describe('saveState / loadState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and loads state roundtrip', () => {
    saveState(mockState);
    expect(loadState()).toEqual(mockState);
  });

  it('returns null when nothing is saved', () => {
    expect(loadState()).toBeNull();
  });

  it('returns null for corrupt data', () => {
    localStorage.setItem('groceries-app-state', 'not-json{{{');
    expect(loadState()).toBeNull();
  });

  it('returns null when items is not an array', () => {
    localStorage.setItem(
      'groceries-app-state',
      JSON.stringify({ items: 'bad', sortMode: 'frequency' }),
    );
    expect(loadState()).toBeNull();
  });

  it('defaults quantity to 1 for items missing the field', () => {
    const oldItem = { id: '1', name: 'Milk', purchaseHistory: [], purchaseOrder: 0, bought: false };
    localStorage.setItem('groceries-app-state', JSON.stringify({ items: [oldItem], sortMode: 'frequency' }));
    const loaded = loadState();
    expect(loaded?.items[0].quantity).toBe(1);
  });
});
