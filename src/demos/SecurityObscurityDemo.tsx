import { useState } from 'react'

type Tab = 'attack' | 'code' | 'defense'

export default function SecurityObscurityDemo() {
  const [tab, setTab] = useState<Tab>('attack')
  const [bundleSearched, setBundleSearched] = useState(false)
  const [urlFound, setUrlFound] = useState<string | null>(null)
  const [accessed, setAccessed] = useState(false)

`

  const searchBundle = () => {
    setBundleSearched(true)
    setTimeout(() => setUrlFound('/secret_xk9z_panel'), 1000)
  }

  return (
    <div className="demo-page">
      <div className="demo-header">
        <div className="vuln-tag">🙈 OWASP A01 — CWE-656</div>
        <h2>Security by Obscurity</h2>
        <p>Cacher l'URL admin avec un nom aléatoire (<code style={{ fontFamily: 'var(--font-mono)', color: 'var(--yellow)' }}>/secret_xk9z_panel</code>) n'est pas une mesure de sécurité. L'URL est souvent visible dans le bundle JavaScript téléchargé par le navigateur.</p>
        <div className="impact-list">
          <span className="impact-badge critical">🔴 CRITIQUE</span>
          <span className="impact-badge high">Fausse impression de sécurité</span>
          <span className="impact-badge medium">URL trouvable dans bundle JS</span>
        </div>
      </div>

      <div className="scenario-box">
        <div className="scenario-title">📋 Scénario</div>
        Un développeur pense sécuriser le panel admin en utilisant une URL secrète comme <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--red)' }}>/secret_xk9z_panel</code> au lieu de <code>/admin</code>. Mais cette URL est incluse dans le code JavaScript envoyé au navigateur — accessible par tout le monde.
      </div>

      <div className="tabs">
        <button className={`tab-btn ${tab === 'attack' ? 'active' : ''}`} onClick={() => setTab('attack')}>🔴 Démonstration</button>
        <button className={`tab-btn ${tab === 'code' ? 'active' : ''}`} onClick={() => setTab('code')}>💻 Code</button>
        <button className={`tab-btn ${tab === 'defense' ? 'active' : ''}`} onClick={() => setTab('defense')}>🛡️ Défense</button>
      </div>

      {tab === 'attack' && (
        <div className="animate-in">
          <div className="card danger">
            <div className="card-title red">🔴 Étape 1 — Inspecter le bundle JavaScript</div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Le navigateur télécharge tout le code JS. L'attaquant fait Ctrl+Shift+I → Sources → recherche "admin" ou "panel".
            </p>
            <button className="btn btn-red attack-btn" onClick={searchBundle} disabled={bundleSearched}>
              🔍 Chercher "admin" dans le bundle JS
            </button>

            {bundleSearched && (
              <div className="terminal" style={{ marginTop: '14px' }}>
                <div className="terminal-header">
                  <span className="terminal-dot red" /><span className="terminal-dot yellow" /><span className="terminal-dot green" />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>main.bundle.js — Search: "admin"</span>
                </div>
                <div className="terminal-body">
                  {!urlFound && <div className="term-warn">⏳ Analyse du bundle en cours...</div>}
                  {urlFound && (
                    <>
                      <div className="term-err">[HIT] Ligne 847 : const ADMIN='<strong>{urlFound}</strong>';</div>
                      <div className="term-err">[HIT] Ligne 848 : fetch(ADMIN+'/health');</div>
                      <div className="term-err">[HIT] Ligne 849 : routes.push({'{'} path:ADMIN {'}'});</div>
                      <div className="term-warn" style={{ marginTop: '8px' }}>→ URL secrète trouvée : {urlFound}</div>
                    </>
                  )}
                </div>
              </div>
            )}

            {urlFound && (
              <div style={{ marginTop: '16px' }}>
                <div className="card-title red" style={{ marginBottom: '12px' }}>🔴 Étape 2 — Accéder directement à l'URL trouvée</div>
                <button
                  className="btn btn-red"
                  onClick={() => setAccessed(true)}
                >
                  🚨 Accéder à {urlFound}
                </button>
                {accessed && (
                  <div className="result-box error" style={{ marginTop: '12px', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <strong>💀 PANEL ADMIN ACCESSIBLE !</strong>
                    <div style={{ fontSize: '12px', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                      HTTP 200 OK — Dashboard admin chargé<br/>
                      Aucune authentification requise — juste connaître l'URL !
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="card success" style={{ marginTop: '16px' }}>
            <div className="card-title green">🛡️ Vraie sécurité — Authentification obligatoire</div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Même si l'URL est <code style={{ fontFamily: 'var(--font-mono)' }}>/admin</code> ou <code style={{ fontFamily: 'var(--font-mono)' }}>/secret_xk9z_panel</code>, le serveur exige une authentification admin valide. L'URL n'a aucune importance — <strong>c'est l'authentification qui protège.</strong>
            </p>
            <div className="result-box success" style={{ marginTop: '12px' }}>
              ✅ app.use('/admin', requireRole('admin')) → L'URL peut être publique, l'auth protège
            </div>
          </div>
        </div>
      )}

      {tab === 'code' && (
        <div className="animate-in two-col">
          <div className="card danger">
            <div className="card-title red">❌ Security by Obscurity</div>
            <div className="code-block">
              <span className="line-bad"><span className="cmt">// ❌ URL "secrète" dans le JS bundle</span></span>
              <span className="line-bad"><span className="kw">const</span> ADMIN = <span className="str">'/secret_xk9z_panel'</span>;</span>
              <span className="line-bad"><span className="fn">fetch</span>(ADMIN);</span>
              <span className="line-bad"><span className="cmt">// Visible dans le bundle téléchargé !</span></span>
              <span className="line-normal"></span>
              <span className="line-bad"><span className="cmt">// Endpoint sans auth</span></span>
              <span className="line-bad">app.<span className="fn">get</span>(<span className="str">'/secret_xk9z_panel'</span>, (req, res) =&gt; {'{'}</span>
              <span className="line-bad">  res.<span className="fn">render</span>(<span className="str">'admin'</span>);</span>
              <span className="line-bad">{'}'});</span>
            </div>
          </div>
          <div className="card success">
            <div className="card-title green">✅ Vraie authentification</div>
            <div className="code-block">
              <span className="line-good"><span className="cmt">// ✅ L'URL peut être publique</span></span>
              <span className="line-good"><span className="cmt">// C'est l'auth qui protège</span></span>
              <span className="line-good">app.<span className="fn">use</span>(<span className="str">'/admin'</span>, <span className="fn">requireRole</span>(<span className="str">'admin'</span>));</span>
              <span className="line-good"><span className="cmt">// Middleware vérifie le token JWT</span></span>
              <span className="line-normal"></span>
              <span className="line-good"><span className="cmt">// Spring Security</span></span>
              <span className="line-good">.<span className="fn">requestMatchers</span>(<span className="str">"/admin/**"</span>)</span>
              <span className="line-good">.<span className="fn">hasRole</span>(<span className="str">"ADMIN"</span>)</span>
              <span className="line-good"><span className="cmt">// Peu importe si l'URL est connue</span></span>
            </div>
          </div>
        </div>
      )}

      {tab === 'defense' && (
        <div className="animate-in card success">
          <div className="card-title green">🛡️ Défenses contre Security by Obscurity</div>
          <ul className="defense-list">
            <li><strong>Ne jamais compter sur le secret de l'URL :</strong> Toute URL dans le code client est accessible. Seul le serveur peut protéger les ressources.</li>
            <li><strong>Authentification obligatoire :</strong> Chaque endpoint sensible doit vérifier l'identité ET le rôle, indépendamment de l'URL.</li>
            <li><strong>Code splitting prudent :</strong> Ne pas inclure les URLs admin dans le bundle JavaScript public. Utiliser des variables d'environnement serveur.</li>
            <li><strong>Audit de bundle :</strong> Inspecter régulièrement le bundle JS pour détecter des informations sensibles exposées.</li>
          </ul>
        </div>
      )}
    </div>
  )
}
