# Tasks: Grocery List App

Incremental task list based on `REQUIREMENTS.md`. Each task produces a measurable and verifiable result. Acceptance criteria serve as the basis for tests. Each task is implemented separately. At the end of each task, `CLAUDE.md` must be created or updated with the relevant project state information at that point.

---

## Task 1: Project setup

**Description:** Configure testing dependencies, web fonts, and base styles extracted from the mockup. Clean up the Vite template code. Upon completion, the app should display an empty screen with the header and the notebook-style background from the mockup.

**Acceptance criteria:**
- Vitest is configured and `pnpm test` runs without errors (even if there are no tests yet)
- `index.html` includes Google Fonts (Caveat + Nunito) and the title "Grocery List"
- `src/App.css` contains CSS variables and global styles from the mockup (colors, typography, notebook effect)
- Vite template files (`hero.png`, `react.svg`, `vite.svg`, demo content in App.tsx) are removed or replaced
- `src/types.ts` exists with the `GroceryItem` and `PurchasedSortMode` interfaces
- `pnpm dev` shows a screen with the orange "Grocery List" header and notebook-lined background
- `CLAUDE.md` created with the current project state

---

## Task 2: Purchase frequency utilities

**Description:** Implement frequency calculation functions based on exponential decay, purchase interval calculation, and history pruning. These functions are the calculation engine of the app.

**Acceptance criteria:**
- `frequencyScore(history, now?)` computes the sum of `exp(-lambda * days)` where `lambda = ln(2)/30`
  - A purchase made today contributes ~1.0 to the score
  - A purchase made 30 days ago contributes ~0.5
  - A purchase made 60 days ago contributes ~0.25
  - Empty history returns 0
- `purchaseInterval(history)` computes the median interval between consecutive purchases
  - With fewer than 2 purchases returns `null`
  - With 2 purchases returns the difference in days between them
  - With multiple purchases returns the median of the differences
- `pruneHistory(history, now?)` removes timestamps older than 180 days
  - Keeps recent ones intact
  - Removes entries older than 180 days
- All tests pass with `pnpm test`
- `CLAUDE.md` updated

---

## Task 3: Main screen - "To Buy" list

**Description:** Implement the "To Buy" section of the main screen, including the state management needed (reducer, context, localStorage persistence) to support this functionality. Seed data must be preloaded in the initial state so the list can be visually verified (this seed data will be removed once the add screen is implemented).

**State to implement in this task:**
- Reducer with actions: `CHECK_ITEM`, `UNCHECK_ITEM` (the minimum for this screen)
- React context with provider and `useGroceries` hook
- localStorage persistence (save on every change, restore on load, fallback to seed data if no saved data exists)

**Acceptance criteria:**
- On first load, preloaded items (seed data) are displayed in the "To Buy" list
- The section header "To Buy" is shown with the item count (e.g., "To Buy (3)")
- Items are displayed sorted by `purchaseOrder`
- Each item shows: unchecked checkbox, item name
- If the item has 2 or more purchases in its history, a badge is shown with the purchase interval (format `c/Nd` where N is the median number of days between purchases)
- Checking an item's checkbox removes it from the "To Buy" list (a timestamp is recorded and pruning is executed)
- State is saved to localStorage (`"groceries-app-state"`) on every change
- Reloading the page restores state from localStorage
- If localStorage contains corrupt data, seed data is used as fallback
- If there are no items to buy, an empty state is shown
- The screen displays correctly on mobile viewport (420px)
- All tests pass with `pnpm test` (reducer, persistence, and component tests)
- `CLAUDE.md` updated

---

## Task 4: Main screen - "Purchased" list

**Description:** Implement the "Purchased" section below the "To Buy" list. Shows purchased items with sorting options, unchecking, and deletion. Seed data should include already-purchased items so this list can be visually verified.

**Additional state to implement:**
- `DELETE_ITEM` action in the reducer
- `SET_SORT_MODE` action in the reducer

**Acceptance criteria:**
- The section header "Purchased" is shown with the item count (e.g., "Purchased (5)")
- Items are sorted by purchase frequency (highest score first) by default
- A toggle at the top allows switching between frequency and alphabetical sorting
- Each item shows: checked checkbox, name, interval badge (if >=2 purchases), delete button/option
- Unchecking an item moves it back to the "To Buy" list at its original position (based on `purchaseOrder`)
- Deleting an item removes it permanently
- If there are no purchased items, an empty state is shown
- All tests pass with `pnpm test`
- `CLAUDE.md` updated

---

## Task 5: Add items screen

**Description:** Implement the floating action button (FAB) and the add items screen with search, filtering, and new item creation. Upon completing this task, seed data must be removed since the user can now create items from the add screen.

**Additional state to implement:**
- `CREATE_AND_ADD` action in the reducer
- `ADD_TO_BUY` action in the reducer
- Remove seed data; empty initial state if no data exists in localStorage

**Acceptance criteria:**
- A floating "+" button appears in the bottom-right corner of the main screen
- Pressing the FAB replaces the main screen with the add screen
- The add screen contains: a text field to search/create, the list of purchased items below, and a button to go back
- With an empty text field, the full list of purchased items is shown unfiltered
- As the user types, the list filters to show only items whose name matches the entered text
- Each item has a "+" button on its right:
  - If the item is already in the to-buy list: the "+" button is shown in **green**
  - If the item is not in the to-buy list: the "+" button is shown in **grey**
- Pressing "+": the item is added to to-buy, the button changes from grey to green, the text field is cleared, and the list resets to show all items
- Pressing **Enter** has the same effect as pressing the "+" button
- If the text does not exactly match any existing item, the first element in the list shows the entered text as a new item
- Pressing "+" on the new item: the item is created and added to the to-buy list with `purchaseOrder` at the end
- The user can add multiple items before returning to the main screen
- All tests pass with `pnpm test`
- `CLAUDE.md` updated

---

## Task 6: Order items screen

**Description:** Implement the ordering screen accessible from a menu in the header. Allows reordering all items (to-buy and purchased) via drag-and-drop.

**Additional state to implement:**
- `REORDER` action in the reducer

**Acceptance criteria:**
- The header has a menu button (three-dot icon)
- The menu includes an "Order" option
- Selecting "Order" opens the ordering screen
- The screen shows all items (to-buy and purchased) in a single list sorted by `purchaseOrder`
- Items can be reordered by dragging (drag-and-drop)
- Drag-and-drop works with touch interactions on mobile
- A button allows returning to the main screen
- Order changes are persisted when returning to the main screen
- The "To Buy" list order reflects the changes made on the ordering screen
- All tests pass with `pnpm test`
- `CLAUDE.md` updated

---

## Task 7: Final polish

**Description:** Visual refinements, animations, and end-to-end app verification.

**Acceptance criteria:**
- Check/uncheck transitions have smooth animations
- Touch interactions work correctly on mobile devices
- Reloading the page preserves all state (items, order, checks)
- The app shows no errors in the browser console
- All tests pass with `pnpm test`
- The app is usable end-to-end: add items, mark as purchased, uncheck, reorder, delete, and everything persists across reloads
- `CLAUDE.md` updated with the final project state
