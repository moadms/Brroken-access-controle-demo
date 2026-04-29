import { useAuth } from '../context/AuthContext'

interface Props {
  onNavigate: (id: string) => void
}

const MODULES = [
  { id: 'idor', icon: '🔍', title: 'IDOR', desc: 'Accéder aux dossiers d\'autres patients en changeant l\'ID', severity: 95, cwe: 'CWE-639' },
  { id: 'vertical', icon: '⬆️', title: 'Élévation Verticale', desc: 'Un patient accède aux endpoints admin', severity: 90, cwe: 'CWE-269' },
  { id: 'horizontal', icon: '↔️', title: 'Élévation Horizontale', desc: 'Patient A modifie les données de Patient B', severity: 85, cwe: 'CWE-639' },
  { id: 'clientbypass', icon: '👁️', title: 'Bypass Client-Side', desc: 'Contourner les restrictions d\'interface via URL directe', severity: 80, cwe: 'CWE-602' },
  { id: 'missingfn', icon: '🚫', title: 'Missing Function AC', desc: 'Endpoints API sans aucune vérification de rôle', severity: 90, cwe: 'CWE-285' },
  { id: 'traversal', icon: '📁', title: 'Directory Traversal', desc: 'Accéder aux fichiers système via ../ dans l\'URL', severity: 92, cwe: 'CWE-22' },
  { id: 'forcedbrowse', icon: '🗺️', title: 'Forced Browsing', desc: 'Deviner des URLs cachées avec un fuzzer', severity: 75, cwe: 'CWE-425' },
  { id: 'jwt', icon: '🔑', title: 'JWT Tampering', desc: 'Modifier le payload JWT pour changer de rôle', severity: 95, cwe: 'CWE-345' },
  { id: 'urlmatching', icon: '🔀', title: 'URL Matching', desc: 'Contournement par manipulation de la casse des URLs', severity: 85, cwe: 'CWE-285' },
  { id: 'session', icon: '🍪', title: 'Session Mgmt', desc: 'Rôle stocké côté client dans un cookie modifiable', severity: 95, cwe: 'CWE-565' },
  { id: 'obscurity', icon: '🙈', title: 'Security Obscurity', desc: 'URL admin cachée mais trouvable dans le bundle JS', severity: 70, cwe: 'CWE-656' },
  { id: 'weakpassword', icon: '🔓', title: 'Weak Passwords', desc: 'Mot de passe par défaut permettant un brute force', severity: 100, cwe: 'CWE-521' },
  { id: 'staleaccounts', icon: '👥', title: 'Stale Accounts', desc: 'Comptes d\'ex-employés toujours actifs avec droits admin', severity: 85, cwe: 'CWE-269' },
  { id: 'xssinjection', icon: '💉', title: 'XSS & Injection', desc: 'Vol de session par XSS et bypass auth par SQLi', severity: 95, cwe: 'CWE-79/89' },
]

export default function HomePage({ onNavigate }: Props) {
  const { user } = useAuth()

  return (
    <div className="home-page">
      <div className="home-hero">
        <h1>🏥 MedSecure <span>BAC Lab</span></h1>
        <p>
          Laboratoire interactif de démonstration des vulnérabilités<br/>
          <strong>Broken Access Control — OWASP A01:2021</strong><br/>
          Système de gestion de dossiers médicaux
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <div style={{ background: 'var(--red-subtle)', border: '1px solid var(--red)', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', color: 'var(--red)' }}>
            🔴 14 Vulnérabilités Démontrées
          </div>
          <div style={{ background: 'var(--green-subtle)', border: '1px solid var(--green)', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', color: 'var(--green)' }}>
            🛡️ Solutions Sécurisées Incluses
          </div>
          <div style={{ background: 'var(--blue-subtle)', border: '1px solid var(--blue)', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', color: 'var(--blue)' }}>
            💻 Code Java Spring Boot
          </div>
        </div>
      </div>

      {user && (
        <div className="card info" style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '28px' }}>👤</span>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Connecté en tant que : {user.name}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Rôle : <strong style={{ color: user.role === 'admin' ? 'var(--red)' : user.role === 'doctor' ? 'var(--green)' : 'var(--blue)' }}>{user.role.toUpperCase()}</strong>
              &nbsp;| ID : {user.id} | Changez d'utilisateur dans la sidebar pour tester différents scénarios
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          📚 Modules de démonstration
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Cliquez sur un module pour voir l'attaque en direct, le code vulnérable vs sécurisé, et les mesures de défense.
        </p>
      </div>

      <div className="vuln-grid">
        {MODULES.map((m, i) => (
          <div key={m.id} className="vuln-card" onClick={() => onNavigate(m.id)}>
            <div className="card-num">MODULE {String(i + 1).padStart(2, '0')} — {m.cwe}</div>
            <div className="card-icon">{m.icon}</div>
            <h3>{m.title}</h3>
            <p>{m.desc}</p>
            <div className="severity-bar">
              <span>Sévérité</span>
              <div className="bar">
                <div className="fill" style={{ width: `${m.severity}%` }} />
              </div>
              <span style={{ color: m.severity >= 90 ? 'var(--red)' : 'var(--yellow)', fontWeight: 700 }}>{m.severity}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: '32px', borderColor: 'var(--yellow)', background: 'var(--yellow-subtle)' }}>
        <div className="card-title" style={{ color: 'var(--yellow)' }}>⚠️ Avertissement — Usage Éducatif</div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Cette application démontre des vulnérabilités réelles dans un environnement simulé contrôlé.
          Les techniques présentées sont destinées à la <strong>formation en cybersécurité</strong>.
          L'exploitation de vulnérabilités sur des systèmes sans autorisation est illégale.
          Réf: OWASP A01:2021 — Broken Access Control (anciennement A5:2017).
        </p>
      </div>
    </div>
  )
}
