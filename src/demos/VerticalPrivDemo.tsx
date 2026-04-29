import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

type Tab = 'attack' | 'code' | 'defense'

const ADMIN_ENDPOINTS = [
  { path: '/api/admin/users', desc: 'Liste tous les utilisateurs', risk: 'critical' },
  { path: '/api/admin/reset-password', desc: 'Réinitialise n\'importe quel mot de passe', risk: 'critical' },
  { path: '/api/admin/export-data', desc: 'Exporte toute la base de données', risk: 'critical' },
  { path: '/api/admin/delete-patient', desc: 'Supprime un dossier patient', risk: 'high' },
  { path: '/api/admin/audit-logs', desc: 'Accès aux logs système', risk: 'high' },
]

export default function VerticalPrivDemo() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('attack')
  const [selected, setSelected] = useState(ADMIN_ENDPOINTS[0])
  const [vulnResult, setVulnResult] = useState<null | { ok: boolean }>(null)
  const [secureResult, setSecureResult] = useState<null | { ok: boolean; msg: string }>(null)
  const [logs, setLogs] = useState<string[]>([])

  const attackVuln = () => {
    setLogs([])
    const isAdmin = user?.role === 'admin'
    const entries = [
      `[→] ${user?.role?.toUpperCase()} accède à : ${selected.path}`,
      `[→] Token: ${user?.token?.slice(0, 40)}...`,
      '[→] Serveur vérifie : isAuthenticated() → true',
      '[!] Serveur vérifie : isAdmin() → ❌ PAS VÉRIFIÉ !',
    ]
    entries.forEach((e, i) => setTimeout(() => setLogs(prev => [...prev, e]), i * 400))
    setTimeout(() => {
      setLogs(prev => [...prev, isAdmin ? '[✓] HTTP 200 OK (admin légitime)' : '[✓] HTTP 200 OK — ACCÈS ACCORDÉ ILLÉGITIMEMENT !'])
      setVulnResult({ ok: true })
    }, entries.length * 400 + 200)
  }

  const attackSecure = () => {
    if (user?.role !== 'admin') {
      setSecureResult({ ok: false, msg: `⛔ HTTP 403 — Rôle requis : ADMIN | Votre rôle : ${user?.role?.toUpperCase()}` })
    } else {
      setSecureResult({ ok: true, msg: '✅ Accès autorisé — Rôle ADMIN vérifié' })
    }
  }

  return (
    <div className="demo-page">
      <div className="demo-header">
        <div className="vuln-tag">⬆️ OWASP A01 — CWE-269</div>
        <h2>Élévation de Privilèges Verticale</h2>
        <p>Un utilisateur avec un rôle faible (patient) accède à des fonctionnalités réservées aux rôles supérieurs (admin). L'application vérifie l'authentification mais pas l'autorisation de rôle.</p>
        <div className="impact-list">
          <span className="impact-badge critical">🔴 CRITIQUE</span>
          <span className="impact-badge high">Contrôle total du système</span>
          <span className="impact-badge high">Accès base de données</span>
        </div>
      </div>

      <div className="scenario-box">
        <div className="scenario-title">📋 Scénario</div>
        <strong>Alice (patient)</strong> découvre l'existence de l'endpoint <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--yellow)' }}>/api/admin/users</code> (via le code JS client ou Burp Suite). Elle envoie une requête avec son token patient et obtient la liste de tous les utilisateurs car le serveur vérifie seulement qu'elle est <em>authentifiée</em>, pas son <em>rôle</em>.
      </div>

      <div className="tabs">
        <button className={`tab-btn ${tab === 'attack' ? 'active' : ''}`} onClick={() => setTab('attack')}>🔴 Démonstration</button>
        <button className={`tab-btn ${tab === 'code' ? 'active' : ''}`} onClick={() => setTab('code')}>💻 Code</button>
        <button className={`tab-btn ${tab === 'defense' ? 'active' : ''}`} onClick={() => setTab('defense')}>🛡️ Défense</button>
      </div>

      {tab === 'attack' && (
        <div className="animate-in">
          <div className="card" style={{ marginBottom: '16px' }}>
            <div className="card-title blue">🎯 Choisir un endpoint admin à cibler</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {ADMIN_ENDPOINTS.map(ep => (
                <div
                  key={ep.path}
                  onClick={() => setSelected(ep)}
                  style={{
                    padding: '10px 14px',
                    background: selected.path === ep.path ? 'var(--red-subtle)' : 'var(--bg-secondary)',
                    border: `1px solid ${selected.path === ep.path ? 'var(--red)' : 'var(--border)'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', color: selected.path === ep.path ? 'var(--red)' : 'var(--text-primary)' }}>{ep.path}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{ep.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="two-col">
            <div className="card danger">
              <div className="card-title red">🔴 Sans vérification de rôle</div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                Connecté en tant que : <strong style={{ color: 'var(--text-primary)' }}>{user?.name} ({user?.role})</strong>
              </p>
              <button className="btn btn-red attack-btn" onClick={attackVuln}>
                🚨 Accéder à {selected.path}
              </button>

              {logs.length > 0 && (
                <div className="terminal" style={{ marginTop: '14px' }}>
                  <div className="terminal-header">
                    <span className="terminal-dot red" /><span className="terminal-dot yellow" /><span className="terminal-dot green" />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>Server Logs</span>
                  </div>
                  <div className="terminal-body">
                    {logs.map((l, i) => (
                      <div key={i} style={{
                        color: l.includes('ILLÉGITIMEMENT') ? 'var(--red)' : l.startsWith('[→]') ? 'var(--text-secondary)' : 'var(--yellow)',
                        marginBottom: '2px', fontSize: '12px'
                      }}>{l}</div>
                    ))}
                  </div>
                </div>
              )}

              {vulnResult?.ok && (
                <div className="result-box error" style={{ marginTop: '12px', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <strong>💥 Accès obtenu à {selected.path} !</strong>
                  <div style={{ fontSize: '12px', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                    [{'{'}id: 101, email: "alice@...", role: "patient"{'}'}, ...]
                  </div>
                </div>
              )}
            </div>

            <div className="card success">
              <div className="card-title green">🛡️ Avec vérification de rôle</div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                L'endpoint vérifie <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--green)' }}>hasRole('ADMIN')</code> avant tout accès
              </p>
              <button className="btn btn-green" onClick={attackSecure}>
                🛡️ Tenter l'accès (sécurisé)
              </button>
              {secureResult && (
                <div className={`result-box ${secureResult.ok ? 'success' : 'error'}`} style={{ marginTop: '12px' }}>
                  {secureResult.msg}
                </div>
              )}
              <div className="result-box info" style={{ marginTop: '12px', fontSize: '12px' }}>
                💡 Changez d'utilisateur (Admin System) dans la sidebar pour tester l'accès légitime
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'code' && (
        <div className="animate-in two-col">
          <div className="card danger">
            <div className="card-title red">❌ Code VULNÉRABLE</div>
            <div className="code-block">
              <span className="line-normal"><span className="kw">@GetMapping</span>(<span className="str">"/api/admin/users"</span>)</span>
              <span className="line-bad"><span className="cmt">// ❌ Vérifie seulement l'authentification</span></span>
              <span className="line-bad"><span className="kw">@PreAuthorize</span>(<span className="str">"isAuthenticated()"</span>)</span>
              <span className="line-normal"><span className="kw">public</span> List{`<User>`} <span className="fn">getAllUsers</span>() {'{'}</span>
              <span className="line-normal">  <span className="kw">return</span> userRepo.<span className="fn">findAll</span>();</span>
              <span className="line-normal">{'}'}</span>
            </div>
          </div>
          <div className="card success">
            <div className="card-title green">✅ Code SÉCURISÉ</div>
            <div className="code-block">
              <span className="line-normal"><span className="kw">@GetMapping</span>(<span className="str">"/api/admin/users"</span>)</span>
              <span className="line-good"><span className="cmt">// ✅ Vérifie le rôle ADMIN</span></span>
              <span className="line-good"><span className="kw">@PreAuthorize</span>(<span className="str">"hasRole('ADMIN')"</span>)</span>
              <span className="line-normal"><span className="kw">public</span> List{`<User>`} <span className="fn">getAllUsers</span>() {'{'}</span>
              <span className="line-normal">  <span className="kw">return</span> userRepo.<span className="fn">findAll</span>();</span>
              <span className="line-normal">{'}'}</span>
              <span className="line-normal"></span>
              <span className="line-good"><span className="cmt">// ✅ Ou via Spring Security Config</span></span>
              <span className="line-good">.<span className="fn">requestMatchers</span>(<span className="str">"/api/admin/**"</span>)</span>
              <span className="line-good">.<span className="fn">hasRole</span>(<span className="str">"ADMIN"</span>)</span>
            </div>
          </div>
        </div>
      )}

      {tab === 'defense' && (
        <div className="animate-in">
          <div className="card success">
            <div className="card-title green">🛡️ Défenses contre l'Élévation Verticale</div>
            <ul className="defense-list">
              <li><strong>Deny by default :</strong> Toute route doit explicitement définir ses permissions. Par défaut, tout accès est refusé.</li>
              <li><strong>@PreAuthorize avec rôles :</strong> Utiliser les annotations Spring Security (<code>@PreAuthorize("hasRole('ADMIN')")</code>) sur chaque endpoint.</li>
              <li><strong>Séparation des APIs :</strong> Préfixer les routes admin (<code>/api/admin/**</code>) et les protéger au niveau de la configuration de sécurité globale.</li>
              <li><strong>Principe du moindre privilège :</strong> Chaque rôle ne doit avoir accès qu'aux fonctions strictement nécessaires.</li>
              <li><strong>Tests de régression :</strong> Automatiser des tests d'autorisation dans la CI/CD pipeline.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
