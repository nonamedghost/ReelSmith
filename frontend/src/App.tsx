import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider } from './context/SettingsContext';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import CreateReel from './pages/CreateReel';
import Library from './pages/Library';
import Settings from './pages/Settings';

function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="create" element={<CreateReel />} />
              <Route path="library" element={<Library />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;
