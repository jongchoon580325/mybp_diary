import { Activity, BarChart2, ClipboardList } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const TABS = [
  { path: '/',        label: '입력',  Icon: Activity },
  { path: '/records', label: '기록',  Icon: ClipboardList },
  { path: '/chart',   label: '차트',  Icon: BarChart2 },
] as const;

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

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
        alignItems: 'stretch',
      }}
    >
      {TABS.map(({ path, label, Icon }) => {
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
            {/* 활성 탭 상단 인디케이터 */}
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
            <span
              style={{
                fontSize: '11px',
                fontWeight: isActive ? 600 : 400,
                letterSpacing: '0.3px',
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
