import { useState, useEffect } from 'react';
import './App.css';
import { GroceryProvider } from './store/grocery-context';
import { Header } from './components/Header';
import { AboutModal } from './components/AboutModal';
import { MainScreen } from './screens/MainScreen';
import { AddScreen } from './screens/AddScreen';
import { OrderScreen } from './screens/OrderScreen';

type Screen = 'main' | 'add' | 'order';

function App() {
  const [screen, setScreen] = useState<Screen>('main');
  const [aboutOpen, setAboutOpen] = useState(false);

  const navigateTo = (s: Screen) => {
    if (s === 'main') {
      history.back();
    } else {
      history.pushState({ screen: s }, '');
      setScreen(s);
    }
  };

  useEffect(() => {
    const handlePop = () => setScreen('main');
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  return (
    <GroceryProvider>
      <div className="app">
        <Header
          onOrderClick={
            screen === 'main' ? () => navigateTo('order') : undefined
          }
          onAboutClick={
            screen === 'main' ? () => setAboutOpen(true) : undefined
          }
        />
        {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}
        {screen === 'main' && <MainScreen onAdd={() => navigateTo('add')} />}
        {screen === 'add' && <AddScreen onClose={() => navigateTo('main')} />}
        {screen === 'order' && (
          <OrderScreen onClose={() => navigateTo('main')} />
        )}
      </div>
    </GroceryProvider>
  );
}

export default App;
