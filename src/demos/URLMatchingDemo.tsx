import { useState } from 'react'

type Tab = 'attack' | 'code' | 'defense'

export default function URLMatchingDemo() {
  const [tab, setTab] = useState<Tab>('attack')
  const [path, setPath] = useState('/Admin/dashboard')
  const [vulnResult, setVulnResult] = useState<null | string>(null)
  const [secureResult, setSecureResult] = useState<null | string>(null)

  const PROTECTED_PATHS = ['/admin', '/admin/dashboard', '/admin/users']

  const checkVuln = () => {
    // Vulnerable: exact case-sensitive match
    const isBlocked = PROTECTED_PATHS.includes(path)
    if (isBlocked) {
      setVulnResult(`⛔ Bloqué — le chemin "${path}" est dans la liste noire`)
    } else {
      setVulnResult(`✅ ACCÈS ACCORDÉ ! Le serveur ne reconnaît pas "${path}" comme chemin admin — case mismatch !`)
    }
  }

  const checkSecure = () => {
    // Secure: normalize to lowercase before check
    const normalized = path.toLowerCase().replace(/\/+$/, '')
    const isBlocked = PROTECTED_PATHS.includes(normalized)
    if (isBlocked) {
      setSecureResult(`⛔ Bloqué — normalisé en "${normalized}" → correspond à la liste noire`)
    } else {
      setSecureResult(`✅ Accès autorisé au chemin public`)
    }
  }

  return (
    <div className="demo-page">
      <div className="demo-header">
        <div className="vuln-tag">🔀 OWASP A01 — CWE-178</div>
        <h2>URL Matching Violations (Case Sensitivity)</h2>
        <p>Le contrôle d'accès vérifie <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--yellow)' }}>/admin</code> mais autorise <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--red)' }}>/Admin</code> ou <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--red)' }}>/ADMIN</code>. La casse différente contourne complètement la liste noire.</p>
        <div className="impact-list">
          <span className="impact-badge critical">🔴 CRITIQUE</span>
          <span className="impact-badge high">Bypass de liste noire</span>
          <span className="impact-badge medium">Facile à exploiter</span>
        </div>
      </div>

      <div className="scenario-box">
        <div className="scenario-title">📋 Scénario</div>
        Le middleware bloque <strong>/admin</strong> mais l'attaquant accède à <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--red)' }}>/Admin/dashboard</code> avec une majuscule — le serveur Spring ou Express laisse passer car la comparaison est sensible à la casse.
      </div>

      <div className="tabs">
        <button className={`tab-btn ${tab === 'attack' ? 'active' : ''}`} onClick={() => setTab('attack')}>🔴 Démonstration</button>
        <button className={`tab-btn ${tab === 'code' ? 'active' : ''}`} onClick={() => setTab('code')}>💻 Code</button>
        <button className={`tab-btn ${tab === 'defense' ? 'active' : ''}`} onClick={() => setTab('defense')}>🛡️ Défense</button>
      </div>

      {tab === 'attack' && (
        <div className="animate-in">
          <div className="card info" style={{ marginBottom: '16px' }}>
            <div className="card-title blue">🎯 Chemins bloqués (liste noire) : /admin | /admin/dashboard | /admin/users</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Essayez : <code style={{ color: 'var(--red)' }}>/Admin/dashboard</code> ou <code style={{ color: 'var(--red)' }}>/ADMIN</code> ou <code style={{ color: 'var(--red)' }}>/admin/../admin</code></div>
          </div>
          <div className="two-col">
            <div className="card danger">
              <div className="card-title red">🔴 Comparaison stricte (vulnérable)</div>
              <div className="input-group">
                <label>Chemin à tester :</label>
                <input className="input-field danger" value={path} onChange={e => setPath(e.target.value)} placeholder="/Admin/dashboard" />
              </div>
              <button className="btn btn-red attack-btn" onClick={checkVuln}>🚨 Tester le chemin</button>
              {vulnResult && (
                <div className={`result-box ${vulnResult.startsWith('✅') ? 'error' : 'info'}`} style={{ marginTop: '12px' }}>
                  {vulnResult}
                </div>
              )}
            </div>
            <div className="card success">
              <div className="card-title green">🛡️ Avec normalisation (sécurisé)</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                Le serveur normalise le chemin en minuscules avant la vérification.
              </div>
              <button className="btn btn-green" onClick={checkSecure}>🛡️ Vérifier (normalisé)</button>
              {secureResult && (
                <div className={`result-box ${secureResult.startsWith('⛔') ? 'error' : 'success'}`} style={{ marginTop: '12px' }}>
                  {secureResult}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'code' && (
        <div className="animate-in two-col">
          <div className="card danger">
            <div className="card-title red">❌ Vulnérable — case-sensitive</div>
            <div className="code-block">
              <span className="line-bad"><span className="cmt">// ❌ Vérification case-sensitive</span></span>
              <span className="line-bad"><span className="kw">if</span> (req.path === <span className="str">'/Admin'</span>) <span className="fn">checkAuth</span>();</span>
              <span className="line-bad"><span className="cmt">// GET /admin → bloqué</span></span>
              <span className="line-bad"><span className="cmt">// GET /Admin → passe ! ❌</span></span>
              <span className="line-normal"></span>
              <span className="line-bad"><span className="cmt">// Spring Security vulnérable</span></span>
              <span className="line-bad">.<span className="fn">requestMatchers</span>(<span className="str">"/admin/**"</span>)</span>
              <span className="line-bad"><span className="cmt">// /Admin/** non couvert !</span></span>
            </div>
          </div>
          <div className="card success">
            <div className="card-title green">✅ Sécurisé — normalisation</div>
            <div className="code-block">
              <span className="line-good"><span className="cmt">// ✅ Normaliser avant vérification</span></span>
              <span className="line-good"><span className="kw">const</span> path = req.path.<span className="fn">toLowerCase</span>();</span>
              <span className="line-good"><span className="kw">if</span> (path === <span className="str">'/admin'</span>) <span className="fn">checkAuth</span>();</span>
              <span className="line-normal"></span>
              <span className="line-good"><span className="cmt">// Spring Boot — désactiver case-insensitive</span></span>
              <span className="line-good">AntPathMatcher matcher = <span className="kw">new</span> <span className="fn">AntPathMatcher</span>();</span>
              <span className="line-good">matcher.<span className="fn">setCaseSensitive</span>(<span className="kw">false</span>);</span>
              <span className="line-normal"></span>
              <span className="line-good"><span className="cmt">// Ou Spring Security config</span></span>
              <span className="line-good">http.<span className="fn">requestMatchers</span>(</span>
              <span className="line-good">  PathRequest.<span className="fn">toAnyPath</span>(<span className="str">"/admin/**"</span>));</span>
            </div>
          </div>
        </div>
      )}

      {tab === 'defense' && (
        <div className="animate-in card success">
          <div className="card-title green">🛡️ Défenses contre URL Matching Violations</div>
          <ul className="defense-list">
            <li><strong>Normaliser les URLs :</strong> Convertir en minuscules et décoder les caractères spéciaux avant toute vérification d'autorisation.</li>
            <li><strong>Ne pas utiliser de listes noires :</strong> Préférer les listes blanches — n'autoriser que ce qui est explicitement permis.</li>
            <li><strong>Configurer le matcher case-insensitive :</strong> Dans Spring, configurer <code>AntPathMatcher.setCaseSensitive(false)</code>.</li>
            <li><strong>Tester les variations :</strong> Dans les audits, tester /Admin, /ADMIN, /aDmIn pour chaque route protégée.</li>
          </ul>
        </div>
      )}
    </div>
  )
}
