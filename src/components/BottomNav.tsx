import { Activity, BarChart2, ClipboardList, Droplets } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const BP_TABS = [
  { path: '/',        label: '입력', Icon: Activity     },
  { path: '/records', label: '기록', Icon: ClipboardList },
  { path: '/chart',   label: '차트', Icon: BarChart2     },
] as const;

const GLUCOSE_TABS = [
  { path: '/glucose',         label: '입력', Icon: Droplets     },
  { path: '/glucose/records', label: '기록', Icon: ClipboardList },
  { path: '/glucose/chart',   label: '차트', Icon: BarChart2     },
] as const;

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const isGlucose = location.pathname.startsWith('/glucose');
  const tabs      = isGlucose ? GLUCOSE_TABS : BP_TABS;

  return (
    <nav
      role="navigation"
      aria-label="메인 탭 네비게이션"
      style={{
        position: 'fixed',
        bottom: 'var(--footer-h)',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '480px',
        height: 'var(--bottom-nav-h)',
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── 도메인 전환 토글 ─────────────────────────────────────── */}
      <div style={{
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface-alt)',
        padding: '0 16px',
      }}>
        {([
          { label: '혈압', isActive: !isGlucose, onClick: () => navigate('/') },
          { label: '혈당', isActive: isGlucose,  onClick: () => navigate('/glucose') },
        ] as const).map(({ label, isActive, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            style={{
              padding: '3px 20px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: isActive ? 'var(--color-primary-700)' : 'transparent',
              color: isActive ? '#fff' : 'var(--color-text-muted)',
              fontSize: '12px',
              fontWeight: isActive ? 700 : 400,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── 3개 탭 ───────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'stretch' }}>
        {tabs.map(({ path, label, Icon }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                position: 'relative',
                transition: 'color var(--transition-fast)',
                color: isActive ? 'var(--color-primary-700)' : 'var(--color-neutral-400)',
              }}
            >
              {isActive && (
                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '20%',
                    width: '60%',
                    height: '3px',
                    backgroundColor: 'var(--color-primary-700)',
                    borderRadius: '0 0 3px 3px',
                  }}
                />
              )}
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
              <span style={{
                fontSize: '11px',
                fontWeight: isActive ? 600 : 400,
                letterSpacing: '0.3px',
              }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
