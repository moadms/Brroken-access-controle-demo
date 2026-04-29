import { useAuth } from '../context/AuthContext'

const DEMO_MODULES = [
  { id: 'home', icon: '🏠', label: 'Vue d\'ensemble', num: null },
  // Original 8
  { id: 'idor', icon: '🔍', label: 'IDOR', num: 'A01' },
  { id: 'vertical', icon: '⬆️', label: 'Élévation Verticale', num: 'A01' },
  { id: 'horizontal', icon: '↔️', label: 'Élévation Horizontale', num: 'A01' },
  { id: 'clientbypass', icon: '👁️', label: 'Bypass Client-Side', num: 'A01' },
  { id: 'missingfn', icon: '🚫', label: 'Missing Function AC', num: 'A01' },
  { id: 'traversal', icon: '📁', label: 'Directory Traversal', num: 'A01' },
  { id: 'forcedbrowse', icon: '🗺️', label: 'Forced Browsing', num: 'A01' },
  { id: 'jwt', icon: '🔑', label: 'JWT Tampering', num: 'A01' },
  // New 6
  { id: 'urlmatching', icon: '🔀', label: 'URL Matching', num: 'A01' },
  { id: 'session', icon: '🍪', label: 'Session Management', num: 'A01' },
  { id: 'obscurity', icon: '🙈', label: 'Security by Obscurity', num: 'A01' },
  { id: 'weakpassword', icon: '🔓', label: 'Weak Passwords', num: 'A01' },
  { id: 'staleaccounts', icon: '👥', label: 'Stale Accounts', num: 'A01' },
  { id: 'xssinjection', icon: '💉', label: 'XSS & Injection', num: 'A03' },
]


interface Props {
  active: string
  onChange: (id: string) => void
}

export default function Sidebar({ active, onChange }: Props) {
  const { user, users, login } = useAuth()

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>🏥 MedSecure Lab</h1>
        <p>Système de dossiers médicaux VIP</p>
        <span className="badge-owasp">OWASP A01:2021</span>
      </div>

      {/* User switcher */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '8px' }}>
          SIMULER UN UTILISATEUR
        </div>
        <select
          value={user?.id ?? ''}
          onChange={e => login(Number(e.target.value))}
          style={{
            width: '100%',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            color: 'var(--text-primary)',
            padding: '8px 10px',
            fontSize: '12px',
            fontFamily: 'var(--font-main)',
            cursor: 'pointer',
          }}
        >
          {users.map(u => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.role})
            </option>
          ))}
        </select>
        {user && (
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span className="status-dot red"></span>
            Connecté en tant que <strong style={{ color: 'var(--text-secondary)', marginLeft: '4px' }}>{user.role}</strong>
          </div>
        )}
      </div>

      <div className="sidebar-section-title">MODULES D'ATTAQUE</div>

      {DEMO_MODULES.map(m => (
        <div
          key={m.id}
          className={`sidebar-item ${active === m.id ? 'active' : ''}`}
          onClick={() => onChange(m.id)}
        >
          <span className="icon">{m.icon}</span>
          <span>{m.label}</span>
          {m.num && <span className="vuln-num">{m.num}</span>}
        </div>
      ))}

      <div style={{ marginTop: 'auto', padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
          ⚠️ <strong style={{ color: 'var(--yellow)' }}>Usage éducatif uniquement</strong>
          <br />Présentation cybersécurité — OWASP A01
        </div>
        <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-secondary)', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
          👨‍💻 Created by <strong style={{ color: 'var(--text-primary)' }}>Moad Moussaoui</strong>
        </div>
      </div>
    </aside>
  )
}
