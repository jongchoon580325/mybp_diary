export default function Footer() {
  return (
    <footer
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '480px',
        height: 'var(--footer-h)',
        backgroundColor: 'var(--color-primary-900)',
        borderRadius: '0 0 18px 18px',
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 16px',
        gap: '2px',
      }}
    >
      <p
        style={{
          margin: 0,
          color: 'var(--color-primary-300)',
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '0.2px',
        }}
      >
        © 2026 BloodPressure Manager · Produced by 나&nbsp;&nbsp;종&nbsp;&nbsp;춘
      </p>
      <p
        style={{
          margin: 0,
          color: 'var(--color-primary-600)',
          fontSize: '10px',
          fontFamily: 'DM Mono, monospace',
        }}
      >
        AHA/ACC 2025 · ESH 2023 · ESC 2024 참조 기준
      </p>
    </footer>
  );
}
