import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PurchasedList } from '../PurchasedList';
import { GroceryProvider } from '../../store/grocery-context';
import type { GroceryItem } from '../../types';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function renderWithItems(items: GroceryItem[], sortMode = 'frequency') {
  localStorage.setItem(
    'groceries-app-state',
    JSON.stringify({ items, sortMode }),
  );
  return render(
    <GroceryProvider>
      <PurchasedList items={items.filter((i) => i.bought)} />
    </GroceryProvider>,
  );
}

describe('PurchasedList', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders purchased items', () => {
    renderWithItems([
      {
        id: '1',
        name: 'Milk',
        purchaseHistory: [],
        purchaseOrder: 0,
        bought: true,
      quantity: 1,
      },
      {
        id: '2',
        name: 'Eggs',
        purchaseHistory: [],
        purchaseOrder: 1,
        bought: true,
      quantity: 1,
      },
    ]);
    expect(screen.getByText('Milk')).toBeInTheDocument();
    expect(screen.getByText('Eggs')).toBeInTheDocument();
  });

  it('shows empty state when no purchased items', () => {
    renderWithItems([]);
    expect(screen.getByText(/Nothing purchased yet/i)).toBeInTheDocument();
  });

  it('sorts by frequency by default', () => {
    const now = Date.now();
    renderWithItems([
      {
        id: '1',
        name: 'Rare',
        purchaseHistory: [now - 60 * MS_PER_DAY],
        purchaseOrder: 0,
        bought: true,
      quantity: 1,
      },
      {
        id: '2',
        name: 'Frequent',
        purchaseHistory: [
          now - 1 * MS_PER_DAY,
          now - 8 * MS_PER_DAY,
          now - 15 * MS_PER_DAY,
        ],
        purchaseOrder: 1,
        bought: true,
      quantity: 1,
      },
    ]);
    const items = screen.getAllByRole('checkbox');
    expect(items[0]).toHaveAccessibleName(/Frequent/);
    expect(items[1]).toHaveAccessibleName(/Rare/);
  });

  it('toggles to alphabetical sort', () => {
    renderWithItems([
      {
        id: '1',
        name: 'Zebra',
        purchaseHistory: [],
        purchaseOrder: 0,
        bought: true,
      quantity: 1,
      },
      {
        id: '2',
        name: 'Apple',
        purchaseHistory: [],
        purchaseOrder: 1,
        bought: true,
      quantity: 1,
      },
    ]);
    fireEvent.click(screen.getByText('A–Z'));
    const items = screen.getAllByRole('checkbox');
    expect(items[0]).toHaveAccessibleName(/Apple/);
    expect(items[1]).toHaveAccessibleName(/Zebra/);
  });

  it('toggles back to frequency sort', () => {
    const now = Date.now();
    renderWithItems(
      [
        {
          id: '1',
          name: 'Rare',
          purchaseHistory: [now - 60 * MS_PER_DAY],
          purchaseOrder: 0,
          bought: true,
      quantity: 1,
        },
        {
          id: '2',
          name: 'Frequent',
          purchaseHistory: [now - 1 * MS_PER_DAY, now - 8 * MS_PER_DAY],
          purchaseOrder: 1,
          bought: true,
      quantity: 1,
        },
      ],
      'alphabetical',
    );
    fireEvent.click(screen.getByText('Frequency'));
    const items = screen.getAllByRole('checkbox');
    expect(items[0]).toHaveAccessibleName(/Frequent/);
  });
});
