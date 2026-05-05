import { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import Modal from './components/Modal';
import ToastNotification from './components/ToastNotification';
import SettingsDrawer from './components/SettingsDrawer';
import NotificationDrawer from './components/NotificationDrawer';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import PwaUpdateBanner from './components/PwaUpdateBanner';
import AuthScreen from './screens/AuthScreen';

const InputScreen          = lazy(() => import('./screens/InputScreen'));
const ChartScreen          = lazy(() => import('./screens/ChartScreen'));
const RecordScreen         = lazy(() => import('./screens/RecordScreen'));
const GlucoseInputScreen   = lazy(() => import('./screens/GlucoseInputScreen'));
const GlucoseRecordScreen  = lazy(() => import('./screens/GlucoseRecordScreen'));
const GlucoseChartScreen   = lazy(() => import('./screens/GlucoseChartScreen'));

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

function AppShell() {
  const { user, isLoading } = useAuthContext();
  const [settingsOpen,     setSettingsOpen]     = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  if (isLoading) return <LoadingScreen />;
  if (!user)     return <AuthScreen />;

  return (
    <BrowserRouter>
      <Header
        onSettingsClick={() => setSettingsOpen(true)}
        onNotificationClick={() => setNotificationOpen(true)}
      />

      <main className="main-content">
        <Suspense fallback={<ScreenFallback />}>
          <Routes>
            <Route path="/"               element={<InputScreen />} />
            <Route path="/chart"          element={<ChartScreen />} />
            <Route path="/records"        element={<RecordScreen />} />
            <Route path="/glucose"         element={<GlucoseInputScreen />} />
            <Route path="/glucose/records" element={<GlucoseRecordScreen />} />
            <Route path="/glucose/chart"   element={<GlucoseChartScreen />} />
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

export default function App() {
  return (
    <AuthProvider>
      {/* 인증과 무관하게 즉시 마운트 → SW 업데이트 이벤트 놓치지 않음 */}
      <PwaUpdateBanner />
      <AppShell />
    </AuthProvider>
  );
}

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg)',
    }}>
      <span style={{
        width: '28px', height: '28px',
        border: '3px solid var(--color-border)',
        borderTopColor: 'var(--color-primary-600)',
        borderRadius: '50%',
        display: 'inline-block',
        animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  );
}
