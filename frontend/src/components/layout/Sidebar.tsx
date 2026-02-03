import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Dashboard', icon: 'grid' },
  { path: '/findings', label: 'Findings', icon: 'alert' },
  { path: '/integrations', label: 'Integrations', icon: 'plug' },
];

const iconMap: Record<string, React.ReactNode> = {
  grid: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  alert: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  plug: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v6m0 12v2m-6-8H2m20 0h-4m-2.3-5.7l-1.4 1.4m-5.6 5.6l-1.4 1.4m12.8 0l-1.4-1.4M6.3 6.3L4.9 7.7" />
      <circle cx="12" cy="14" r="4" />
    </svg>
  ),
};

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 260,
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    background: 'var(--sidebar-bg)',
    color: 'var(--sidebar-text)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 40,
  },
  brand: {
    padding: '24px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  brandName: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#ffffff',
    letterSpacing: '-0.025em',
  },
  brandTag: {
    fontSize: '0.7rem',
    fontWeight: 600,
    color: 'var(--fc-accent)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    marginTop: 2,
  },
  nav: {
    padding: '16px 12px',
    flex: 1,
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 12px',
    borderRadius: 8,
    color: 'var(--sidebar-text)',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: 500,
    transition: 'all 0.15s ease',
    marginBottom: 4,
  },
  activeLink: {
    background: 'var(--sidebar-active)',
    color: '#ffffff',
  },
  footer: {
    padding: '16px 20px',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
};

export function Sidebar() {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.brand}>
        <div style={styles.brandName}>ForgeComply 360</div>
        <div style={styles.brandTag}>Continuous Monitoring</div>
      </div>

      <nav style={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            style={({ isActive }) => ({
              ...styles.link,
              ...(isActive ? styles.activeLink : {}),
            })}
          >
            {iconMap[item.icon]}
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div style={styles.footer}>
        ForgeComply 360 v1.0
      </div>
    </aside>
  );
}
