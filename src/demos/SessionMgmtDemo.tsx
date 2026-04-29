import { useState } from 'react'

type Tab = 'attack' | 'code' | 'defense'

export default function SessionMgmtDemo() {
  const [tab, setTab] = useState<Tab>('attack')
  const [cookieRole, setCookieRole] = useState('user')
  const [vulnResult, setVulnResult] = useState<null | string>(null)
  const [secureResult, setSecureResult] = useState<null | string>(null)

  const attackVuln = () => {
    // Vulnerable: trusts role from cookie
    if (cookieRole === 'admin') {
      setVulnResult('💀 ACCÈS ADMIN ACCORDÉ — Le serveur fait confiance au cookie role=admin envoyé par le client !')
    } else {
      setVulnResult(`Accès ${cookieRole} — essayez de changer le cookie en "admin"`)
    }
  }

  const attackSecure = () => {
    // Secure: role comes from server-side session
    setSecureResult('⛔ HTTP 403 — Le rôle est lu depuis la session serveur (non modifiable par le client). Cookie ignoré.')
  }

  return (
    <div className="demo-page">
      <div className="demo-header">
        <div className="vuln-tag">🍪 OWASP A01 — CWE-565</div>
        <h2>Insecure Session Management</h2>
        <p>Le rôle ou les privilèges de l'utilisateur sont stockés dans un cookie ou un champ caché côté client. L'attaquant modifie simplement la valeur pour s'octroyer des droits admin.</p>
        <div className="impact-list">
          <span className="impact-badge critical">🔴 CRITIQUE</span>
          <span className="impact-badge high">Élévation de privilèges</span>
          <span className="impact-badge medium">Simple à exploiter (DevTools)</span>
        </div>
      </div>

      <div className="scenario-box">
        <div className="scenario-title">📋 Scénario</div>
        L'application stocke <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--red)' }}>role=user</code> dans un cookie. L'attaquant ouvre les DevTools, modifie le cookie en <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--red)' }}>role=admin</code> et recharge la page. Le serveur lit le cookie et accorde l'accès admin.
      </div>

      <div className="tabs">
        <button className={`tab-btn ${tab === 'attack' ? 'active' : ''}`} onClick={() => setTab('attack')}>🔴 Démonstration</button>
        <button className={`tab-btn ${tab === 'code' ? 'active' : ''}`} onClick={() => setTab('code')}>💻 Code</button>
        <button className={`tab-btn ${tab === 'defense' ? 'active' : ''}`} onClick={() => setTab('defense')}>🛡️ Défense</button>
      </div>

      {tab === 'attack' && (
        <div className="animate-in">
          <div className="two-col">
            <div className="card danger">
              <div className="card-title red">🔴 Rôle dans le cookie (vulnérable)</div>
              <div className="terminal" style={{ marginBottom: '14px' }}>
                <div className="terminal-header">
                  <span className="terminal-dot red" /><span className="terminal-dot yellow" /><span className="terminal-dot green" />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>Application Cookies</span>
                </div>
                <div className="terminal-body">
                  <div className="term-out">Cookie: session_id=abc123; <span style={{ color: 'var(--red)' }}>role=<strong>{cookieRole}</strong></span></div>
                  <div className="term-warn" style={{ marginTop: '6px' }}>→ Modifier via DevTools → Application → Cookies</div>
                </div>
              </div>
              <div className="input-group">
                <label>Valeur du cookie "role" (modifiez-la !) :</label>
                <select className="input-field danger" value={cookieRole} onChange={e => setCookieRole(e.target.value)}>
                  <option value="user">user</option>
                  <option value="moderator">moderator</option>
                  <option value="admin">admin</option>
                  <option value="superadmin">superadmin</option>
                </select>
              </div>
              <button className="btn btn-red attack-btn" onClick={attackVuln}>🚨 Envoyer la requête</button>
              {vulnResult && (
                <div className={`result-box ${vulnResult.startsWith('💀') ? 'error' : 'info'}`} style={{ marginTop: '12px' }}>
                  {vulnResult}
                </div>
              )}
            </div>

            <div className="card success">
              <div className="card-title green">🛡️ Rôle depuis la session serveur</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: '1.6' }}>
                Le rôle est stocké côté <strong>serveur</strong> dans la session (identifiée par l'ID de session). Le client ne peut pas modifier son rôle.
              </div>
              <div className="terminal" style={{ marginBottom: '14px' }}>
                <div className="terminal-header">
                  <span className="terminal-dot red" /><span className="terminal-dot yellow" /><span className="terminal-dot green" />
                </div>
                <div className="terminal-body">
                  <div className="term-ok">Server-side: sessions["abc123"].role = "user"</div>
                  <div className="term-out">Cookie client: session_id=abc123 (juste l'ID)</div>
                  <div className="term-ok">→ Le rôle ne peut pas être modifié par le client</div>
                </div>
              </div>
              <button className="btn btn-green" onClick={attackSecure}>🛡️ Tenter la modification</button>
              {secureResult && (
                <div className="result-box error" style={{ marginTop: '12px' }}>{secureResult}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'code' && (
        <div className="animate-in two-col">
          <div className="card danger">
            <div className="card-title red">❌ Rôle dans le cookie</div>
            <div className="code-block">
              <span className="line-bad"><span className="cmt">// ❌ Trust client cookie</span></span>
              <span className="line-bad"><span className="kw">const</span> role = req.cookies.role;</span>
              <span className="line-bad"><span className="kw">if</span> (role === <span className="str">'admin'</span>) <span className="fn">grantAccess</span>();</span>
              <span className="line-normal"></span>
              <span className="line-bad"><span className="cmt">// ❌ Rôle dans champ caché HTML</span></span>
              <span className="line-bad">{`<`}input type=<span className="str">"hidden"</span> name=<span className="str">"role"</span></span>
              <span className="line-bad">       value=<span className="str">"user"</span> /{`>`}</span>
              <span className="line-bad"><span className="cmt">// L'attaquant change "user" → "admin"</span></span>
            </div>
          </div>
          <div className="card success">
            <div className="card-title green">✅ Rôle en session serveur</div>
            <div className="code-block">
              <span className="line-good"><span className="cmt">// ✅ Stocker le rôle côté serveur</span></span>
              <span className="line-good"><span className="cmt">// À la connexion :</span></span>
              <span className="line-good">req.session.userId = user.id;</span>
              <span className="line-good">req.session.role = user.role;</span>
              <span className="line-normal"></span>
              <span className="line-good"><span className="cmt">// À chaque requête :</span></span>
              <span className="line-good"><span className="kw">const</span> role = req.session.role;</span>
              <span className="line-good"><span className="kw">if</span> (role === <span className="str">'admin'</span>) <span className="fn">grantAccess</span>();</span>
              <span className="line-normal"></span>
              <span className="line-good"><span className="cmt">// Spring Security : @AuthenticationPrincipal</span></span>
              <span className="line-good">UserDetails u = (UserDetails) SecurityContextHolder</span>
              <span className="line-good">  .<span className="fn">getContext</span>().<span className="fn">getAuthentication</span>()</span>
              <span className="line-good">  .<span className="fn">getPrincipal</span>();</span>
            </div>
          </div>
        </div>
      )}

      {tab === 'defense' && (
        <div className="animate-in card success">
          <div className="card-title green">🛡️ Défenses contre Insecure Session Management</div>
          <ul className="defense-list">
            <li><strong>Jamais de données sensibles dans les cookies non signés :</strong> Le rôle, les permissions et l'ID utilisateur ne doivent jamais être dans un cookie modifiable par le client.</li>
            <li><strong>Sessions côté serveur :</strong> Stocker le rôle dans la session serveur (Redis, mémoire serveur) — le client ne possède que l'ID de session opaque.</li>
            <li><strong>Cookies HttpOnly + Secure :</strong> Ajouter les flags HttpOnly (non accessible par JS) et Secure (HTTPS uniquement).</li>
            <li><strong>SameSite=Strict :</strong> Protéger contre les attaques CSRF.</li>
            <li><strong>Expiration des sessions :</strong> Sessions avec timeout et invalidation à la déconnexion.</li>
          </ul>
        </div>
      )}
    </div>
  )
}
