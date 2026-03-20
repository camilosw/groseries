import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddScreen } from '../AddScreen';
import { GroceryProvider } from '../../store/grocery-context';
import type { GroceryItem } from '../../types';

function renderWithItems(items: GroceryItem[]) {
  localStorage.setItem(
    'groceries-app-state',
    JSON.stringify({ items, sortMode: 'frequency' }),
  );
  return render(
    <GroceryProvider>
      <AddScreen onClose={() => {}} />
    </GroceryProvider>,
  );
}

const milkPurchased: GroceryItem = {
  id: '1',
  name: 'Milk',
  purchaseHistory: [],
  purchaseOrder: 0,
  bought: true,
};
const eggsPurchased: GroceryItem = {
  id: '2',
  name: 'Eggs',
  purchaseHistory: [],
  purchaseOrder: 1,
  bought: true,
};
const breadToBuy: GroceryItem = {
  id: '3',
  name: 'Bread',
  purchaseHistory: [],
  purchaseOrder: 2,
  bought: false,
};

describe('AddScreen', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows all purchased items when search is empty', () => {
    renderWithItems([milkPurchased, eggsPurchased, breadToBuy]);
    expect(screen.getByText('Milk')).toBeInTheDocument();
    expect(screen.getByText('Eggs')).toBeInTheDocument();
    expect(screen.queryByText('Bread')).not.toBeInTheDocument();
  });

  it('filters items by name as user types', () => {
    renderWithItems([milkPurchased, eggsPurchased]);
    fireEvent.change(screen.getByPlaceholderText(/search or add/i), {
      target: { value: 'mil' },
    });
    expect(screen.getByText('Milk')).toBeInTheDocument();
    expect(screen.queryByText('Eggs')).not.toBeInTheDocument();
  });

  it('shows new item row when text does not match any existing item exactly', () => {
    renderWithItems([milkPurchased]);
    fireEvent.change(screen.getByPlaceholderText(/search or add/i), {
      target: { value: 'Butter' },
    });
    expect(screen.getByLabelText(/Add Butter/i)).toBeInTheDocument();
  });

  it('does not show new item row when text exactly matches an existing item', () => {
    renderWithItems([milkPurchased]);
    fireEvent.change(screen.getByPlaceholderText(/search or add/i), {
      target: { value: 'Milk' },
    });
    // Milk appears as existing, but no "new item" row
    expect(screen.getByText('Milk')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Add Milk/i })).toHaveLength(
      1,
    );
  });

  it('pressing + on existing purchased item adds to to-buy and clears field', () => {
    renderWithItems([milkPurchased]);
    const input = screen.getByPlaceholderText(/search or add/i);
    fireEvent.change(input, { target: { value: 'Milk' } });
    fireEvent.click(screen.getByLabelText(/Add Milk/i));
    expect(input).toHaveValue('');
    // Milk is now in to-buy — searching for it again shows green button
    fireEvent.change(input, { target: { value: 'Milk' } });
    expect(screen.getByLabelText(/Already in list/i)).toBeInTheDocument();
  });

  it('pressing + on new item creates the item and adds to to-buy', () => {
    renderWithItems([]);
    const input = screen.getByPlaceholderText(/search or add/i);
    fireEvent.change(input, { target: { value: 'Butter' } });
    fireEvent.click(screen.getByLabelText(/Add Butter/i));
    expect(input).toHaveValue('');
    // Butter now exists in to-buy — searching shows green button
    fireEvent.change(input, { target: { value: 'Butter' } });
    expect(screen.getByLabelText(/Already in list/i)).toBeInTheDocument();
  });

  it('pressing Enter on new item has same effect as pressing +', () => {
    renderWithItems([]);
    const input = screen.getByPlaceholderText(/search or add/i);
    fireEvent.change(input, { target: { value: 'Butter' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(input).toHaveValue('');
    fireEvent.change(input, { target: { value: 'Butter' } });
    expect(screen.getByLabelText(/Already in list/i)).toBeInTheDocument();
  });

  it('pressing Enter on existing purchased item has same effect as pressing +', () => {
    renderWithItems([milkPurchased]);
    const input = screen.getByPlaceholderText(/search or add/i);
    fireEvent.change(input, { target: { value: 'Milk' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(input).toHaveValue('');
    fireEvent.change(input, { target: { value: 'Milk' } });
    expect(screen.getByLabelText(/Already in list/i)).toBeInTheDocument();
  });

  it('items already in to-buy show green + button', () => {
    renderWithItems([milkPurchased, breadToBuy]);
    const input = screen.getByPlaceholderText(/search or add/i);
    fireEvent.change(input, { target: { value: 'B' } });
    // Bread is in to-buy — should show green button
    expect(screen.getByLabelText(/Already in list/i)).toBeInTheDocument();
  });
});
