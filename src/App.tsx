import { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import Modal from './components/Modal';
import ToastNotification from './components/ToastNotification';
import SettingsDrawer from './components/SettingsDrawer';
import NotificationDrawer from './components/NotificationDrawer';

const InputScreen  = lazy(() => import('./screens/InputScreen'));
const ChartScreen  = lazy(() => import('./screens/ChartScreen'));
const RecordScreen = lazy(() => import('./screens/RecordScreen'));

function ScreenFallback() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '200px', color: 'var(--color-text-muted)', fontSize: '14px',
    }}>
      <span style={{
        width: '20px', height: '20px',
        border: '2px solid var(--color-border)',
        borderTopColor: 'var(--color-primary-600)',
        borderRadius: '50%',
        display: 'inline-block',
        animation: 'spin 0.8s linear infinite',
        marginRight: '10px',
      }} />
      로딩 중...
    </div>
  );
}

export default function App() {
  const [settingsOpen,      setSettingsOpen]      = useState(false);
  const [notificationOpen,  setNotificationOpen]  = useState(false);

  return (
    <BrowserRouter>
      <Header
        onSettingsClick={() => setSettingsOpen(true)}
        onNotificationClick={() => setNotificationOpen(true)}
      />

      <main className="main-content">
        <Suspense fallback={<ScreenFallback />}>
          <Routes>
            <Route path="/"        element={<InputScreen />} />
            <Route path="/chart"   element={<ChartScreen />} />
            <Route path="/records" element={<RecordScreen />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
      <BottomNav />

      {/* 전역 모달 & 토스트 */}
      <Modal />
      <ToastNotification />

      {/* 드로어 */}
      <SettingsDrawer
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      <NotificationDrawer
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
      />
    </BrowserRouter>
  );
}
