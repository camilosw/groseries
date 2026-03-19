# Grocery List App — Project State

## Current phase: Phase 6 complete (Order screen)

## Stack
- React 19 + TypeScript + Vite
- @dnd-kit/core + @dnd-kit/sortable (drag-and-drop with touch support)
- Vitest + @testing-library/react + jsdom (unit/component tests)
- Google Fonts: Caveat (handwritten) + Nunito (UI)

## Key decisions (from PLAN.md)
- Purchase history: timestamp array, exponential decay frequency scoring
- Purchase interval displayed as `c/Nd` (median gap, shown when ≥2 purchases)
- Add button is a FAB, not inline add-bar
- Reordering on dedicated Order screen (accessible from header ⋮ menu)
- UI language: English

## File structure so far
```
src/
  main.tsx          -- Entry point
  App.tsx           -- GroceryProvider + Header + screen router (main | add | order)
  App.css           -- Global styles: CSS vars, reset, .app container, notebook effect
  index.css         -- Minimal body reset
  types.ts          -- GroceryItem interface, PurchasedSortMode type
  test-setup.ts     -- @testing-library/jest-dom import for Vitest
  utils/
    frequency.ts                -- frequencyScore(), purchaseInterval(), pruneHistory()
    __tests__/
      frequency.test.ts         -- 16 tests (all passing)
  store/
    storage.ts                  -- GroceryState type, saveState(), loadState(), seedData()
    grocery-reducer.ts          -- groceryReducer + GroceryAction type (all actions implemented)
    grocery-context.tsx         -- GroceryProvider, useGroceries hook (empty initial state)
    __tests__/
      grocery-reducer.test.ts   -- 20 tests (all passing)
      storage.test.ts           -- 6 tests (all passing)
  components/
    Header.tsx / Header.css     -- Sticky orange header with ⋮ menu button + dropdown
    SectionHeader.tsx           -- "To Buy (N)" / "Purchased (N)" divider
    BuyItem.tsx                 -- Unchecked item (checkbox + name + c/Nd badge)
    BuyList.tsx                 -- Sorted to-buy list + empty state
    PurchasedItem.tsx           -- Checked item (checkbox + name + c/Nd badge + delete btn)
    PurchasedList.tsx           -- Sort toggle (frequency/alphabetical) + purchased items + empty state
    Fab.tsx / Fab.css           -- Floating "+" button
    AddItemRow.tsx              -- Row in add screen (name + green/grey "+" button)
    __tests__/
      PurchasedList.test.tsx    -- 5 tests (all passing)
  screens/
    MainScreen.tsx / MainScreen.css  -- To Buy + Purchased sections + FAB
    AddScreen.tsx / AddScreen.css    -- Search input + item list + new item row
    OrderScreen.tsx / OrderScreen.css -- Drag-and-drop reorder list (@dnd-kit, touch support)
    __tests__/
      MainScreen.test.tsx       -- 11 tests (all passing)
      AddScreen.test.tsx        -- 8 tests (all passing)
```

## What's next: Phase 7 (Polish)
- Check/uncheck transition animations
- Verify touch interactions work correctly on mobile
- Final persistence verification (reload preserves all state)
- No errors in the browser console

## Running
- `pnpm dev` — dev server (empty initial state; FAB opens add screen)
- `pnpm test` — run all tests with Vitest (64 passing)
- `pnpm build` — production build
