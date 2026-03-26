import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MainScreen } from '../MainScreen';
import { GroceryProvider } from '../../store/grocery-context';
import type { GroceryItem } from '../../types';

function renderWithItems(items: GroceryItem[]) {
  localStorage.setItem(
    'groceries-app-state',
    JSON.stringify({ items, sortMode: 'frequency' }),
  );
  return render(
    <GroceryProvider>
      <MainScreen onAdd={() => {}} />
    </GroceryProvider>,
  );
}

describe('MainScreen', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders to-buy items sorted by purchaseOrder', () => {
    renderWithItems([
      {
        id: '1',
        name: 'Milk',
        purchaseHistory: [],
        purchaseOrder: 1,
        bought: false,
      },
      {
        id: '2',
        name: 'Eggs',
        purchaseHistory: [],
        purchaseOrder: 0,
        bought: false,
      },
    ]);
    const checkboxes = screen.getAllByRole('checkbox');
    // Eggs (order 0) should appear before Milk (order 1)
    expect(checkboxes[0]).toHaveAccessibleName(/Eggs/);
    expect(checkboxes[1]).toHaveAccessibleName(/Milk/);
  });

  it('checking an item removes it from the to-buy list', () => {
    renderWithItems([
      {
        id: '1',
        name: 'Milk',
        purchaseHistory: [],
        purchaseOrder: 0,
        bought: false,
      },
    ]);
    fireEvent.click(screen.getByLabelText(/Mark Milk as purchased/i));
    expect(
      screen.queryByLabelText(/Mark Milk as purchased/i),
    ).not.toBeInTheDocument();
  });

  it('shows empty state when no items to buy', () => {
    renderWithItems([]);
    expect(screen.getByText(/Nothing to buy/i)).toBeInTheDocument();
  });

  it('shows section header with correct item count', () => {
    renderWithItems([
      {
        id: '1',
        name: 'Milk',
        purchaseHistory: [],
        purchaseOrder: 0,
        bought: false,
      },
      {
        id: '2',
        name: 'Eggs',
        purchaseHistory: [],
        purchaseOrder: 1,
        bought: false,
      },
    ]);
    expect(screen.getByText('To Buy')).toBeInTheDocument();
    expect(screen.getByText('(2)')).toBeInTheDocument();
  });

  it('does not render bought items in the to-buy list', () => {
    renderWithItems([
      {
        id: '1',
        name: 'Milk',
        purchaseHistory: [],
        purchaseOrder: 0,
        bought: false,
      },
      {
        id: '2',
        name: 'Eggs',
        purchaseHistory: [],
        purchaseOrder: 1,
        bought: true,
      },
    ]);
    expect(
      screen.getByLabelText(/Mark Milk as purchased/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/Mark Eggs as purchased/i),
    ).not.toBeInTheDocument();
  });

  it('shows Nd badge when item has 2+ purchases', () => {
    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    const now = Date.now();
    renderWithItems([
      {
        id: '1',
        name: 'Milk',
        purchaseHistory: [now - 7 * MS_PER_DAY, now - 14 * MS_PER_DAY],
        purchaseOrder: 0,
        bought: false,
      },
    ]);
    expect(screen.getByText(/^\d+d$/)).toBeInTheDocument();
  });

  it('renders purchased items', () => {
    renderWithItems([
      {
        id: '1',
        name: 'Milk',
        purchaseHistory: [],
        purchaseOrder: 0,
        bought: true,
      },
    ]);
    expect(screen.getByText('Milk')).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Mark Milk as not purchased/i),
    ).toBeInTheDocument();
  });

  it('unchecking a purchased item moves it to to-buy', () => {
    renderWithItems([
      {
        id: '1',
        name: 'Milk',
        purchaseHistory: [],
        purchaseOrder: 0,
        bought: true,
      },
    ]);
    fireEvent.click(screen.getByLabelText(/Mark Milk as not purchased/i));
    expect(
      screen.getByLabelText(/Mark Milk as purchased/i),
    ).toBeInTheDocument();
  });

  it('deleting a to-buy item removes it permanently', () => {
    renderWithItems([
      {
        id: '1',
        name: 'Milk',
        purchaseHistory: [],
        purchaseOrder: 0,
        bought: false,
      },
    ]);
    fireEvent.click(screen.getByLabelText(/Delete Milk/i));
    expect(screen.queryByText('Milk')).not.toBeInTheDocument();
  });

  it('deleting a purchased item removes it permanently', () => {
    renderWithItems([
      {
        id: '1',
        name: 'Milk',
        purchaseHistory: [],
        purchaseOrder: 0,
        bought: true,
      },
    ]);
    fireEvent.click(screen.getByLabelText(/Delete Milk/i));
    expect(screen.queryByText('Milk')).not.toBeInTheDocument();
  });

  it('shows empty state when no purchased items', () => {
    renderWithItems([
      {
        id: '1',
        name: 'Milk',
        purchaseHistory: [],
        purchaseOrder: 0,
        bought: false,
      },
    ]);
    expect(screen.getByText(/Nothing purchased yet/i)).toBeInTheDocument();
  });

  it('clicking a buy item name enters edit mode', () => {
    renderWithItems([
      {
        id: '1',
        name: 'Milk',
        purchaseHistory: [],
        purchaseOrder: 0,
        bought: false,
      },
    ]);
    fireEvent.click(screen.getByText('Milk'));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('editing a buy item name and pressing Enter updates the name', () => {
    renderWithItems([
      {
        id: '1',
        name: 'Milk',
        purchaseHistory: [],
        purchaseOrder: 0,
        bought: false,
      },
    ]);
    fireEvent.click(screen.getByText('Milk'));
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Oat Milk' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByText('Oat Milk')).toBeInTheDocument();
    expect(screen.queryByText('Milk')).not.toBeInTheDocument();
  });

  it('shows Purchased section header with item count', () => {
    renderWithItems([
      {
        id: '1',
        name: 'Milk',
        purchaseHistory: [],
        purchaseOrder: 0,
        bought: true,
      },
      {
        id: '2',
        name: 'Eggs',
        purchaseHistory: [],
        purchaseOrder: 1,
        bought: true,
      },
    ]);
    expect(screen.getByText('Purchased')).toBeInTheDocument();
    expect(screen.getByText('(2)')).toBeInTheDocument();
  });
});
