import { useState } from 'react';
import './App.css';
import { GroceryProvider } from './store/grocery-context';
import { Header } from './components/Header';
import { MainScreen } from './screens/MainScreen';
import { AddScreen } from './screens/AddScreen';
import { OrderScreen } from './screens/OrderScreen';

type Screen = 'main' | 'add' | 'order';

function App() {
  const [screen, setScreen] = useState<Screen>('main');

  return (
    <GroceryProvider>
      <div className="app">
        <Header onOrderClick={screen === 'main' ? () => setScreen('order') : undefined} />
        {screen === 'main' && (
          <MainScreen onAdd={() => setScreen('add')} />
        )}
        {screen === 'add' && (
          <AddScreen onClose={() => setScreen('main')} />
        )}
        {screen === 'order' && (
          <OrderScreen onClose={() => setScreen('main')} />
        )}
      </div>
    </GroceryProvider>
  );
}

export default App;
