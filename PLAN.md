# Plan: Grocery List App

## Context

Implement a mobile-first grocery checklist app using React + TypeScript + Vite (already configured). Visual design comes from `mockup.html` and functionality from `REQUIREMENTS.md`. Where they differ, requirements take priority. The UI language is English.

**Key decisions:**
- Purchase history stored as timestamp array; frequency uses exponential decay scoring
- Display purchase interval as `c/Nd` (median gap between consecutive purchases, shown when ≥2 purchases)
- Use @dnd-kit for drag-and-drop with touch support
- Add button is a FAB (not the inline add-bar from mockup)
- UI in English (header: "Grocery List", sections: "To Buy" / "Purchased", etc.)
- Reordering is done on a dedicated Order screen (accessible from header menu), not inline in lists

---

## Data model

```typescript
// src/types.ts
interface GroceryItem {
  id: string;                   // crypto.randomUUID()
  name: string;
  purchaseHistory: number[];    // array of Unix timestamps (ms), pruned to last 180 days
  purchaseOrder: number;        // manual position (drag)
  bought: boolean;              // false = "to buy", true = "purchased"
}

type PurchasedSortMode = 'frequency' | 'alphabetical';
```

### Frequency helpers (`src/utils/frequency.ts`)

```typescript
// Exponential decay score: Σ exp(-λ × days_since_purchase), λ = ln(2)/30
function frequencyScore(history: number[], now?: number): number

// Median gap between consecutive timestamps → displayed as "c/Nd"
// Returns null if fewer than 2 purchases
function purchaseInterval(history: number[]): number | null

// Remove timestamps older than 180 days from the array
function pruneHistory(history: number[], now?: number): number[]
```

---

## File structure

```
src/
  main.tsx                      -- Entry point (exists, adjust)
  App.tsx                       -- Screen router (main vs add vs order)
  App.css                       -- Global styles, CSS variables, notebook effect

  types.ts                      -- TypeScript types

  utils/
    frequency.ts                -- frequencyScore(), purchaseInterval(), pruneHistory()

  store/
    grocery-context.tsx         -- Context + Provider + useGroceries hook
    grocery-reducer.ts          -- Reducer with all actions
    storage.ts                  -- localStorage helpers

  screens/
    MainScreen.tsx              -- Main screen: both lists + FAB
    MainScreen.css
    AddScreen.tsx               -- Add screen: search + purchased items list
    AddScreen.css
    OrderScreen.tsx             -- Order screen: all items in a single drag-and-drop list
    OrderScreen.css

  components/
    Header.tsx / Header.css     -- Sticky orange header with menu button (three-dot icon)
    SectionHeader.tsx           -- Divider "To Buy (6)" / "Purchased (5)"
    BuyList.tsx                 -- "To Buy" list
    BuyItem.tsx                 -- Unchecked item (checkbox + name + interval badge)
    PurchasedList.tsx           -- "Purchased" list with sort controls
    PurchasedItem.tsx           -- Checked item (checkbox + name + interval badge + delete btn)
    Fab.tsx / Fab.css           -- Floating "+" button
    AddItemRow.tsx              -- Row in add screen (name + green/grey "+" button)
```

---

## State management

**useReducer + Context** in `grocery-context.tsx`:

```typescript
type GroceryAction =
  | { type: 'CHECK_ITEM'; id: string }                 // to buy → purchased (append timestamp, prune >180d)
  | { type: 'UNCHECK_ITEM'; id: string }               // purchased → to buy (preserves order)
  | { type: 'DELETE_ITEM'; id: string }
  | { type: 'SET_SORT_MODE'; mode: PurchasedSortMode }
  | { type: 'CREATE_AND_ADD'; name: string }           // new item → to buy
  | { type: 'ADD_TO_BUY'; id: string }                 // existing purchased item → to buy
  | { type: 'REORDER'; activeId: string; overId: string }
```

Actions are introduced incrementally across tasks:
- Task 3: `CHECK_ITEM`, `UNCHECK_ITEM`
- Task 4: `DELETE_ITEM`, `SET_SORT_MODE`
- Task 5: `CREATE_AND_ADD`, `ADD_TO_BUY`
- Task 6: `REORDER`

- Persistence: `useEffect` saves to localStorage on every state change
- Key: `"groceries-app-state"`
- Initial load: read from localStorage or seed data (seed data removed in Task 5)

---

## Implementation phases

Each phase adds a requirement incrementally with its corresponding tests. Run `pnpm test` at the end of each phase to verify before moving on. Each phase must create or update `CLAUDE.md` with the current project state.

### Phase 1: Project setup
- `pnpm add @dnd-kit/core @dnd-kit/sortable`
- `pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom`
- Add Vitest config in `vite.config.ts` (test environment: jsdom)
- Add `"test": "vitest run"` script to package.json
- Update `index.html`: lang="en", title "Grocery List", Google Fonts (Caveat + Nunito)
- Create `src/types.ts`
- Replace `src/App.css` with global styles from mockup (CSS variables, reset, notebook effect)
- Clean up `src/index.css` (minimal reset)
- Remove Vite template files (`hero.png`, `react.svg`, `vite.svg`, demo content in App.tsx)
- `pnpm dev` shows a screen with the orange "Grocery List" header and notebook-lined background
- Create `CLAUDE.md`

### Phase 2: Frequency utils
**Requirement:** Purchase history as timestamps, exponential decay scoring, interval display, 180-day pruning.
- Create `src/utils/frequency.ts` (frequencyScore, purchaseInterval, pruneHistory)
- **Tests:** `src/utils/__tests__/frequency.test.ts`
  - frequencyScore: exponential decay, recent vs old purchases, empty history
  - purchaseInterval: median gap calculation, < 2 purchases returns null
  - pruneHistory: removes entries > 180 days, keeps recent ones
- Update `CLAUDE.md`

### Phase 3: Main screen — To Buy list
**Requirement:** Display items with bought=false, sorted by purchaseOrder. Check an item moves it to purchased. State management with reducer, context, and localStorage persistence. Seed data preloaded for visual verification.

**State to implement:**
- Reducer with actions: `CHECK_ITEM`, `UNCHECK_ITEM`
- React context with provider and `useGroceries` hook
- localStorage persistence (save on every change, restore on load, fallback to seed data if no saved data exists)

**Components:**
- Create `Header.tsx` + `Header.css`
- Create `SectionHeader.tsx`
- Create `BuyItem.tsx` (checkbox + name + `c/Nd` badge when ≥2 purchases)
- Create `BuyList.tsx` (render items sorted by purchaseOrder)
- Create `MainScreen.tsx` + `MainScreen.css` (for now just to-buy list)
- Rewrite `App.tsx` (provider + header + main screen)

**Tests:**
- `src/store/__tests__/grocery-reducer.test.ts`
  - CHECK_ITEM: sets bought=true, appends timestamp, prunes >180d
  - UNCHECK_ITEM: sets bought=false, preserves purchaseOrder
- `src/store/__tests__/storage.test.ts`
  - Save and load roundtrip, corrupt data fallback to seed data
- `src/screens/__tests__/MainScreen.test.tsx`
  - Renders to-buy items sorted by purchaseOrder
  - Checking an item removes it from the to-buy list
  - Empty state shown when no items to buy

**Acceptance:**
- On first load, seed data items are displayed in the "To Buy" list
- Section header shows "To Buy" with item count
- State persists across reloads
- Displays correctly on mobile viewport (420px)
- Update `CLAUDE.md`

### Phase 4: Main screen — Purchased list
**Requirement:** Display items with bought=true, sorted by frequency. Sort mode toggle (frequency/alphabetical). Uncheck returns item to to-buy. Delete removes item permanently.

**Additional state:** `DELETE_ITEM`, `SET_SORT_MODE` actions in the reducer.

- Create `PurchasedItem.tsx` (checkbox + name + `c/Nd` badge + delete btn)
- Create `PurchasedList.tsx` (sort mode toggle + render items)
- Add purchased section to `MainScreen.tsx`
- Seed data should include already-purchased items for visual verification

**Tests:**
- `src/screens/__tests__/MainScreen.test.tsx` (extend)
  - Renders purchased items
  - Unchecking a purchased item moves it back to to-buy at its original position
  - Deleting a purchased item removes it permanently
  - Empty state shown when no purchased items
- `src/components/__tests__/PurchasedList.test.tsx`
  - Default sort by frequency score
  - Toggle to alphabetical sort
- Update `CLAUDE.md`

### Phase 5: Add screen
**Requirement:** FAB opens add screen. Search/filter purchased items. Create new items. Green/grey + button toggle. Enter key support. Remove seed data.

**Additional state:** `CREATE_AND_ADD`, `ADD_TO_BUY` actions in the reducer. Remove seed data; empty initial state if no data exists in localStorage.

- Create `Fab.tsx` + `Fab.css`
- Create `AddItemRow.tsx` (name + green/grey + button)
- Create `AddScreen.tsx` + `AddScreen.css`
- Wire up screen navigation in `App.tsx`

**Tests:** `src/screens/__tests__/AddScreen.test.tsx`
  - Shows all purchased items when search is empty
  - Filters items by name as user types
  - Shows "new item" row when text doesn't match any existing item exactly
  - Pressing + on existing item: adds to to-buy, button turns green, field clears
  - Pressing + on new item: creates item and adds to to-buy
  - Pressing Enter has same effect as pressing "+"
  - Items already in to-buy show green + button
- Update `CLAUDE.md`

### Phase 6: Order screen
**Requirement:** Header menu with "Order" option opens a dedicated order screen. All items (to-buy and purchased) shown in a single list sorted by purchaseOrder. Drag-and-drop reordering with touch support.

**Additional state:** `REORDER` action in the reducer.

- Add menu button (three-dot icon) to `Header.tsx`
- Create `OrderScreen.tsx` + `OrderScreen.css`
- Integrate @dnd-kit for drag-and-drop with touch support
- Wire up screen navigation in `App.tsx` (main → order → main)
- Order changes persist when returning to main screen

**Tests:**
- `src/store/__tests__/grocery-reducer.test.ts` (extend)
  - REORDER: updates purchaseOrder for affected items
  - Items maintain correct relative order after reorder
- Update `CLAUDE.md`

### Phase 7: Polish
- Check/uncheck transition animations
- Verify touch interactions work correctly on mobile
- Final persistence verification (reload preserves all state)
- No errors in the browser console
- End-to-end usable: add items, mark as purchased, uncheck, reorder, delete, persist across reloads
- Update `CLAUDE.md` with final project state

---

## Verification

1. **Tests**: `pnpm test` — all unit and component tests pass
2. **Dev server**: `pnpm dev` — verify app loads without errors
3. **Add items**: FAB → add screen → create new items → verify they appear in "To Buy"
4. **Check/uncheck**: checkbox moves items between lists, timestamp appended to purchaseHistory, `c/Nd` badge updates
5. **Reorder**: Order screen → drag-and-drop → verify order persists after reload
6. **Sort purchased**: toggle between frequency/alphabetical
7. **Delete**: × button permanently removes item
8. **Persistence**: reload page, verify data is preserved
9. **Mobile**: test at 420px viewport, verify touch drag works
