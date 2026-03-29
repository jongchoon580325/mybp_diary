import { Bell, Settings } from 'lucide-react';

interface HeaderProps {
  onSettingsClick?: () => void;
  onNotificationClick?: () => void;
  notificationCount?: number;
}

export default function Header({ onSettingsClick, onNotificationClick, notificationCount = 0 }: HeaderProps) {
  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '480px',
        height: 'var(--header-h)',
        backgroundColor: 'var(--color-primary-900)',
        borderRadius: '18px 18px 0 0',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        boxShadow: '0 2px 12px rgb(0 0 0 / 0.25)',
      }}
    >
      {/* 로고 + 타이틀 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src="/icon.svg" alt="BP Manager 로고" width={30} height={30} />
        <div>
          <div
            style={{
              color: 'var(--color-primary-100)',
              fontWeight: 700,
              fontSize: '15px',
              lineHeight: 1.2,
              letterSpacing: '-0.3px',
            }}
          >
            BP Manager
          </div>
          <div
            style={{
              color: 'var(--color-primary-400)',
              fontSize: '10px',
              fontFamily: 'DM Mono, monospace',
            }}
          >
            v1.1
          </div>
        </div>
      </div>

      {/* 중앙 타이틀 */}
      <div style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        pointerEvents: 'none',
      }}>
        <span style={{
          color: '#ffffff',
          fontWeight: 800,
          fontSize: '17px',
          letterSpacing: '-0.4px',
          whiteSpace: 'nowrap',
        }}>
          혈압 / 혈당 관리
        </span>
      </div>

      {/* 우측 액션 버튼 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {/* 알림 버튼 */}
        <button
          aria-label="알림"
          onClick={onNotificationClick}
          style={{
            position: 'relative',
            background: 'none',
            border: 'none',
            color: 'var(--color-primary-200)',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Bell size={20} />
          {notificationCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                background: 'var(--color-status-danger)',
                color: '#fff',
                borderRadius: '9999px',
                width: '16px',
                height: '16px',
                fontSize: '10px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {notificationCount}
            </span>
          )}
        </button>

        {/* 설정 버튼 */}
        <button
          aria-label="설정"
          onClick={onSettingsClick}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-primary-200)',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
}
