import { createContext, useContext, useEffect, useReducer } from 'react';
import type { ReactNode } from 'react';
import { groceryReducer } from './grocery-reducer';
import type { GroceryAction } from './grocery-reducer';
import { loadState, saveState } from './storage';
import type { GroceryState } from './storage';

interface GroceryContextValue {
  state: GroceryState;
  dispatch: React.Dispatch<GroceryAction>;
}

const GroceryContext = createContext<GroceryContextValue | null>(null);

export function GroceryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    groceryReducer,
    undefined,
    () => loadState() ?? { items: [], sortMode: 'frequency' as const },
  );

  useEffect(() => {
    saveState(state);
  }, [state]);

  return (
    <GroceryContext.Provider value={{ state, dispatch }}>
      {children}
    </GroceryContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGroceries(): GroceryContextValue {
  const ctx = useContext(GroceryContext);
  if (!ctx) throw new Error('useGroceries must be used within GroceryProvider');
  return ctx;
}
