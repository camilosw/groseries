import { describe, it, expect, vi } from 'vitest';
import { groceryReducer } from '../grocery-reducer';
import type { GroceryState } from '../storage';
import type { GroceryItem } from '../../types';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function makeItem(overrides: Partial<GroceryItem> = {}): GroceryItem {
  return {
    id: 'test-id',
    name: 'Milk',
    purchaseHistory: [],
    purchaseOrder: 0,
    bought: false,
    ...overrides,
  };
}

function makeState(items: GroceryItem[]): GroceryState {
  return { items, sortMode: 'frequency' };
}

describe('CHECK_ITEM', () => {
  it('sets bought to true', () => {
    const state = makeState([makeItem({ id: '1' })]);
    const next = groceryReducer(state, { type: 'CHECK_ITEM', id: '1' });
    expect(next.items[0].bought).toBe(true);
  });

  it('appends a timestamp to purchaseHistory', () => {
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);
    const state = makeState([makeItem({ id: '1' })]);
    const next = groceryReducer(state, { type: 'CHECK_ITEM', id: '1' });
    expect(next.items[0].purchaseHistory).toContain(now);
    vi.restoreAllMocks();
  });

  it('prunes history entries older than 180 days', () => {
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);
    const old = now - 181 * MS_PER_DAY;
    const state = makeState([makeItem({ id: '1', purchaseHistory: [old] })]);
    const next = groceryReducer(state, { type: 'CHECK_ITEM', id: '1' });
    expect(next.items[0].purchaseHistory).not.toContain(old);
    vi.restoreAllMocks();
  });

  it('does not modify other items', () => {
    const item2 = makeItem({ id: '2', name: 'Eggs' });
    const state = makeState([makeItem({ id: '1' }), item2]);
    const next = groceryReducer(state, { type: 'CHECK_ITEM', id: '1' });
    expect(next.items[1]).toEqual(item2);
  });
});

describe('UNCHECK_ITEM', () => {
  it('sets bought to false', () => {
    const state = makeState([makeItem({ id: '1', bought: true })]);
    const next = groceryReducer(state, { type: 'UNCHECK_ITEM', id: '1' });
    expect(next.items[0].bought).toBe(false);
  });

  it('preserves purchaseOrder', () => {
    const state = makeState([
      makeItem({ id: '1', bought: true, purchaseOrder: 3 }),
    ]);
    const next = groceryReducer(state, { type: 'UNCHECK_ITEM', id: '1' });
    expect(next.items[0].purchaseOrder).toBe(3);
  });

  it('does not modify other items', () => {
    const item2 = makeItem({ id: '2', name: 'Eggs', bought: true });
    const state = makeState([makeItem({ id: '1', bought: true }), item2]);
    const next = groceryReducer(state, { type: 'UNCHECK_ITEM', id: '1' });
    expect(next.items[1]).toEqual(item2);
  });
});

describe('DELETE_ITEM', () => {
  it('removes the item from the list', () => {
    const state = makeState([
      makeItem({ id: '1' }),
      makeItem({ id: '2', name: 'Eggs' }),
    ]);
    const next = groceryReducer(state, { type: 'DELETE_ITEM', id: '1' });
    expect(next.items).toHaveLength(1);
    expect(next.items[0].id).toBe('2');
  });

  it('does not modify other items', () => {
    const item2 = makeItem({ id: '2', name: 'Eggs' });
    const state = makeState([makeItem({ id: '1' }), item2]);
    const next = groceryReducer(state, { type: 'DELETE_ITEM', id: '1' });
    expect(next.items[0]).toEqual(item2);
  });

  it('handles deleting a non-existent id gracefully', () => {
    const state = makeState([makeItem({ id: '1' })]);
    const next = groceryReducer(state, { type: 'DELETE_ITEM', id: 'nope' });
    expect(next.items).toHaveLength(1);
  });
});

describe('REORDER', () => {
  it('moves item to new position', () => {
    const items = [
      makeItem({ id: '1', name: 'A', purchaseOrder: 0 }),
      makeItem({ id: '2', name: 'B', purchaseOrder: 1 }),
      makeItem({ id: '3', name: 'C', purchaseOrder: 2 }),
    ];
    const state = makeState(items);
    const next = groceryReducer(state, {
      type: 'REORDER',
      activeId: '1',
      overId: '3',
    });
    const sorted = [...next.items].sort(
      (a, b) => a.purchaseOrder - b.purchaseOrder,
    );
    expect(sorted.map((i) => i.name)).toEqual(['B', 'C', 'A']);
  });

  it('assigns sequential purchaseOrder values starting at 0', () => {
    const items = [
      makeItem({ id: '1', purchaseOrder: 0 }),
      makeItem({ id: '2', name: 'Eggs', purchaseOrder: 1 }),
      makeItem({ id: '3', name: 'Bread', purchaseOrder: 2 }),
    ];
    const state = makeState(items);
    const next = groceryReducer(state, {
      type: 'REORDER',
      activeId: '3',
      overId: '1',
    });
    const sorted = [...next.items].sort(
      (a, b) => a.purchaseOrder - b.purchaseOrder,
    );
    expect(sorted.map((i) => i.purchaseOrder)).toEqual([0, 1, 2]);
  });

  it('is a no-op when activeId equals overId', () => {
    const items = [
      makeItem({ id: '1' }),
      makeItem({ id: '2', name: 'Eggs', purchaseOrder: 1 }),
    ];
    const state = makeState(items);
    const next = groceryReducer(state, {
      type: 'REORDER',
      activeId: '1',
      overId: '1',
    });
    expect(next).toBe(state);
  });

  it('is a no-op when id not found', () => {
    const state = makeState([makeItem({ id: '1' })]);
    const next = groceryReducer(state, {
      type: 'REORDER',
      activeId: 'x',
      overId: '1',
    });
    expect(next).toBe(state);
  });
});

describe('SET_SORT_MODE', () => {
  it('sets sortMode to alphabetical', () => {
    const state = makeState([]);
    const next = groceryReducer(state, {
      type: 'SET_SORT_MODE',
      mode: 'alphabetical',
    });
    expect(next.sortMode).toBe('alphabetical');
  });

  it('sets sortMode to frequency', () => {
    const state = { ...makeState([]), sortMode: 'alphabetical' as const };
    const next = groceryReducer(state, {
      type: 'SET_SORT_MODE',
      mode: 'frequency',
    });
    expect(next.sortMode).toBe('frequency');
  });

  it('does not modify items', () => {
    const items = [makeItem({ id: '1' })];
    const state = makeState(items);
    const next = groceryReducer(state, {
      type: 'SET_SORT_MODE',
      mode: 'alphabetical',
    });
    expect(next.items).toEqual(items);
  });
});

describe('REMOVE_FROM_BUY', () => {
  it('sets bought to true', () => {
    const state = makeState([makeItem({ id: '1', bought: false })]);
    const next = groceryReducer(state, { type: 'REMOVE_FROM_BUY', id: '1' });
    expect(next.items[0].bought).toBe(true);
  });

  it('does not modify purchaseHistory', () => {
    const history = [Date.now() - 1000];
    const state = makeState([
      makeItem({ id: '1', bought: false, purchaseHistory: history }),
    ]);
    const next = groceryReducer(state, { type: 'REMOVE_FROM_BUY', id: '1' });
    expect(next.items[0].purchaseHistory).toEqual(history);
  });

  it('does not modify other items', () => {
    const item2 = makeItem({ id: '2', name: 'Eggs' });
    const state = makeState([makeItem({ id: '1' }), item2]);
    const next = groceryReducer(state, { type: 'REMOVE_FROM_BUY', id: '1' });
    expect(next.items[1]).toEqual(item2);
  });
});

describe('RENAME_ITEM', () => {
  it('renames the item when name is valid and unique', () => {
    const state = makeState([makeItem({ id: '1', name: 'Milk' })]);
    const next = groceryReducer(state, {
      type: 'RENAME_ITEM',
      id: '1',
      name: 'Oat Milk',
    });
    expect(next.items[0].name).toBe('Oat Milk');
  });

  it('trims whitespace from the new name', () => {
    const state = makeState([makeItem({ id: '1', name: 'Milk' })]);
    const next = groceryReducer(state, {
      type: 'RENAME_ITEM',
      id: '1',
      name: '  Oat Milk  ',
    });
    expect(next.items[0].name).toBe('Oat Milk');
  });

  it('returns state unchanged when trimmed name is empty', () => {
    const state = makeState([makeItem({ id: '1', name: 'Milk' })]);
    const next = groceryReducer(state, {
      type: 'RENAME_ITEM',
      id: '1',
      name: '   ',
    });
    expect(next).toBe(state);
  });

  it('returns state unchanged when another item has the same name (case-insensitive)', () => {
    const state = makeState([
      makeItem({ id: '1', name: 'Milk' }),
      makeItem({ id: '2', name: 'Eggs' }),
    ]);
    const next = groceryReducer(state, {
      type: 'RENAME_ITEM',
      id: '1',
      name: 'eggs',
    });
    expect(next).toBe(state);
  });

  it('allows renaming to the same name (not a self-duplicate)', () => {
    const state = makeState([makeItem({ id: '1', name: 'Milk' })]);
    const next = groceryReducer(state, {
      type: 'RENAME_ITEM',
      id: '1',
      name: 'Milk',
    });
    expect(next.items[0].name).toBe('Milk');
  });

  it('does not modify other items', () => {
    const item2 = makeItem({ id: '2', name: 'Eggs' });
    const state = makeState([makeItem({ id: '1', name: 'Milk' }), item2]);
    const next = groceryReducer(state, {
      type: 'RENAME_ITEM',
      id: '1',
      name: 'Oat Milk',
    });
    expect(next.items[1]).toEqual(item2);
  });
});
