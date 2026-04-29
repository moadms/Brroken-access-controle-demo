import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

type Tab = 'attack' | 'code' | 'defense'

export default function ClientBypassDemo() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('attack')
  const [showHiddenAdmin, setShowHiddenAdmin] = useState(false)
  const [directUrl, setDirectUrl] = useState('')
  const [vulnResult, setVulnResult] = useState<null | string>(null)
  const [secureResult, setSecureResult] = useState<null | string>(null)

  const tryDirectAccess = () => {
    // Vulnerable: no server-side check, just hidden from UI
    if (directUrl === '/admin/dashboard' || directUrl === '/admin/users') {
      setVulnResult(`✅ Accès accordé à ${directUrl} — Page retournée avec toutes les données admin !`)
    } else {
      setVulnResult('Essayez /admin/dashboard ou /admin/users')
    }
  }

  const trySecureAccess = () => {
    if (user?.role !== 'admin') {
      setSecureResult(`⛔ HTTP 403 — Le serveur vérifie le rôle. Votre rôle : ${user?.role}`)
    } else {
      setSecureResult('✅ Accès admin accordé côté serveur')
    }
  }

  return (
    <div className="demo-page">
      <div className="demo-header">
        <div className="vuln-tag">👁️ OWASP A01 — CWE-602</div>
        <h2>Bypass de Contrôle Côté Client</h2>
        <p>L'application masque les éléments d'interface (boutons, menus) selon le rôle, mais ne protège pas les routes et endpoints côté serveur. La sécurité est une illusion visuelle.</p>
        <div className="impact-list">
          <span className="impact-badge critical">🔴 CRITIQUE</span>
          <span className="impact-badge high">Contournement total</span>
          <span className="impact-badge medium">Accès via URL directe</span>
        </div>
      </div>

      <div className="scenario-box">
        <div className="scenario-title">📋 Scénario</div>
        <strong>Alice (patient)</strong> ne voit pas le bouton "Administration" dans l'interface. Mais en inspectant le code source ou avec Burp Suite, elle découvre l'URL <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--yellow)' }}>/admin/dashboard</code> et l'ouvre directement dans son navigateur.
      </div>

      <div className="tabs">
        <button className={`tab-btn ${tab === 'attack' ? 'active' : ''}`} onClick={() => setTab('attack')}>🔴 Démonstration</button>
        <button className={`tab-btn ${tab === 'code' ? 'active' : ''}`} onClick={() => setTab('code')}>💻 Code</button>
        <button className={`tab-btn ${tab === 'defense' ? 'active' : ''}`} onClick={() => setTab('defense')}>🛡️ Défense</button>
      </div>

      {tab === 'attack' && (
        <div className="animate-in">
          <div className="card danger">
            <div className="card-title red">🔴 Interface "sécurisée" côté client seulement</div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Ci-dessous, la navigation de MedSecure. Le bouton Admin est <strong>caché</strong> pour les patients. Mais que se passe-t-il si on inspecte le HTML ?
            </p>

            {/* Simulated nav bar */}
            <div style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '12px 20px',
              display: 'flex',
              gap: '16px',
              alignItems: 'center',
              marginBottom: '16px',
            }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Navigation :</span>
              <button className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: '12px' }}>📋 Mes dossiers</button>
              <button className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: '12px' }}>👤 Mon profil</button>
              {/* Hidden admin button - visible if showHiddenAdmin or role is admin */}
              {(user?.role === 'admin' || showHiddenAdmin) && (
                <button className="btn btn-red" style={{ padding: '6px 14px', fontSize: '12px' }}>
                  ⚙️ Administration
                </button>
              )}
              {user?.role !== 'admin' && !showHiddenAdmin && (
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  [Bouton Admin caché via CSS display:none]
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <button
                className="btn btn-ghost"
                onClick={() => setShowHiddenAdmin(!showHiddenAdmin)}
                style={{ fontSize: '12px' }}
              >
                🔍 {showHiddenAdmin ? 'Cacher' : 'Révéler'} l'élément caché (Inspect)
              </button>
            </div>

            <div className="input-group">
              <label>Saisir directement une URL admin :</label>
              <input
                className="input-field danger"
                placeholder="/admin/dashboard"
                value={directUrl}
                onChange={e => setDirectUrl(e.target.value)}
              />
            </div>
            <button className="btn btn-red attack-btn" onClick={tryDirectAccess}>
              🚨 Accès URL Direct (sans passer par l'UI)
            </button>
            {vulnResult && (
              <div className={`result-box ${vulnResult.startsWith('✅') ? 'error' : 'info'}`} style={{ marginTop: '12px' }}>
                {vulnResult}
              </div>
            )}
          </div>

          <div className="card success" style={{ marginTop: '16px' }}>
            <div className="card-title green">🛡️ Protection côté SERVEUR</div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Même si l'URL est trouvée, le serveur vérifie le rôle à chaque requête.
            </p>
            <button className="btn btn-green" onClick={trySecureAccess}>
              🛡️ Tenter l'accès (vérif. serveur)
            </button>
            {secureResult && (
              <div className={`result-box ${secureResult.startsWith('✅') ? 'success' : 'error'}`} style={{ marginTop: '12px' }}>
                {secureResult}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'code' && (
        <div className="animate-in two-col">
          <div className="card danger">
            <div className="card-title red">❌ Sécurité FRONTEND seulement (React)</div>
            <div className="code-block">
              <span className="line-bad"><span className="cmt">// ❌ Caché visuellement, mais l'URL existe !</span></span>
              <span className="line-bad">{'{'}<span className="kw">user</span>.role === <span className="str">'admin'</span> && (</span>
              <span className="line-bad">  {`<`}<span className="fn">Link</span> to=<span className="str">"/admin"</span>{`>`}Admin{`</Link>`}</span>
              <span className="line-bad">){'}'}</span>
              <span className="line-normal"></span>
              <span className="line-bad"><span className="cmt">// ❌ Route React sans protection serveur</span></span>
              <span className="line-bad">{`<`}<span className="fn">Route</span> path=<span className="str">"/admin"</span></span>
              <span className="line-bad">  element={'{'}{`<`}<span className="fn">AdminPage</span> /{`>`}{'}'}</span>
              <span className="line-bad">/{'>'}</span>
            </div>
          </div>
          <div className="card success">
            <div className="card-title green">✅ Protection SERVEUR + FRONTEND</div>
            <div className="code-block">
              <span className="line-good"><span className="cmt">// ✅ Route protégée côté React</span></span>
              <span className="line-good">{`<`}<span className="fn">ProtectedRoute</span> role=<span className="str">"admin"</span>{`>`}</span>
              <span className="line-good">  {`<`}<span className="fn">AdminPage</span> /{`>`}</span>
              <span className="line-good">{`</`}<span className="fn">ProtectedRoute</span>{`>`}</span>
              <span className="line-normal"></span>
              <span className="line-good"><span className="cmt">// ✅ ET vérification Spring Security</span></span>
              <span className="line-good">.<span className="fn">requestMatchers</span>(<span className="str">"/admin/**"</span>)</span>
              <span className="line-good">.<span className="fn">hasRole</span>(<span className="str">"ADMIN"</span>)</span>
              <span className="line-normal"></span>
              <span className="line-good"><span className="cmt">// ✅ ET sur chaque endpoint API</span></span>
              <span className="line-good"><span className="kw">@PreAuthorize</span>(<span className="str">"hasRole('ADMIN')"</span>)</span>
              <span className="line-good"><span className="kw">public</span> ... <span className="fn">adminEndpoint</span>() {'{ ... }'}</span>
            </div>
          </div>
        </div>
      )}

      {tab === 'defense' && (
        <div className="animate-in card success">
          <div className="card-title green">🛡️ Règle d'or : Never Trust the Client</div>
          <ul className="defense-list">
            <li><strong>La sécurité côté client n'est PAS de la sécurité :</strong> CSS display:none, v-if, ou ng-if ne protègent pas les routes — ils cachent juste des éléments.</li>
            <li><strong>Double vérification :</strong> Chaque API endpoint et chaque route serveur doit avoir sa propre vérification d'autorisation.</li>
            <li><strong>ProtectedRoute en React :</strong> Composant wrapper qui vérifie le rôle ET redirige vers 403 si non autorisé.</li>
            <li><strong>Filtres Spring Security :</strong> Configurer SecurityFilterChain pour intercepter toutes les requêtes avant qu'elles atteignent les contrôleurs.</li>
            <li><strong>Tester avec les DevTools :</strong> Lors des audits, toujours inspecter le HTML pour les éléments cachés et tester l'accès direct aux URLs.</li>
          </ul>
        </div>
      )}
    </div>
  )
}
