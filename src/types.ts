export interface GroceryItem {
  id: string; // crypto.randomUUID()
  name: string;
  purchaseHistory: number[]; // array of Unix timestamps (ms), pruned to last 180 days
  purchaseOrder: number; // manual position (drag)
  bought: boolean; // false = "to buy", true = "purchased"
  quantity: number; // how many to buy, minimum 1
}

export type PurchasedSortMode = 'frequency' | 'alphabetical';
