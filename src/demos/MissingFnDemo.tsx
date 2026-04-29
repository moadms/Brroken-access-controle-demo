import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

type Tab = 'attack' | 'code' | 'defense'

const API_ENDPOINTS = [
  { method: 'GET', path: '/api/admin/users', desc: 'Liste tous les utilisateurs' },
  { method: 'DELETE', path: '/api/admin/patient/102', desc: 'Supprime un patient' },
  { method: 'GET', path: '/api/admin/audit-logs', desc: 'Logs d\'audit système' },
  { method: 'POST', path: '/api/admin/reset-password', desc: 'Reset mot de passe' },
]

export default function MissingFnDemo() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('attack')
  const [endpoint, setEndpoint] = useState(API_ENDPOINTS[0])
  const [scanning, setScanning] = useState(false)
  const [scanResults, setScanResults] = useState<{ ep: typeof API_ENDPOINTS[0]; status: number }[]>([])
  const [secureResult, setSecureResult] = useState<null | string>(null)

  const runScan = () => {
    setScanning(true)
    setScanResults([])
    API_ENDPOINTS.forEach((ep, i) => {
      setTimeout(() => {
        setScanResults(prev => [...prev, { ep, status: 200 }]) // Vulnerable: all return 200
        if (i === API_ENDPOINTS.length - 1) setScanning(false)
      }, (i + 1) * 500)
    })
  }

  const trySecure = () => {
    if (user?.role !== 'admin') {
      setSecureResult(`⛔ HTTP 403 Forbidden — Méthode non accessible. Rôle requis: ADMIN`)
    } else {
      setSecureResult('✅ Accès autorisé pour Admin System')
    }
  }

  return (
    <div className="demo-page">
      <div className="demo-header">
        <div className="vuln-tag">🚫 OWASP A01 — CWE-285</div>
        <h2>Missing Function Level Access Control</h2>
        <p>Certaines fonctions métier (endpoints API, méthodes de service) n'ont aucune vérification d'accès. Un attaquant peut les découvrir et les appeler librement.</p>
        <div className="impact-list">
          <span className="impact-badge critical">🔴 CRITIQUE</span>
          <span className="impact-badge high">Fonctions administratives exposées</span>
          <span className="impact-badge medium">Découverte par fuzzing</span>
        </div>
      </div>

      <div className="scenario-box">
        <div className="scenario-title">📋 Scénario</div>
        Un attaquant utilise <strong>Burp Suite</strong> ou un scanner d'API pour énumérer les endpoints. Il découvre des routes admin non protégées et peut les appeler directement avec n'importe quel token valide.
      </div>

      <div className="tabs">
        <button className={`tab-btn ${tab === 'attack' ? 'active' : ''}`} onClick={() => setTab('attack')}>🔴 Démonstration</button>
        <button className={`tab-btn ${tab === 'code' ? 'active' : ''}`} onClick={() => setTab('code')}>💻 Code</button>
        <button className={`tab-btn ${tab === 'defense' ? 'active' : ''}`} onClick={() => setTab('defense')}>🛡️ Défense</button>
      </div>

      {tab === 'attack' && (
        <div className="animate-in">
          <div className="card danger">
            <div className="card-title red">🔴 Scanner d'API — Endpoints sans protection</div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Simulation d'un scan d'API (comme Burp Suite Intruder ou ffuf) depuis le compte de <strong>{user?.name} ({user?.role})</strong>
            </p>
            <button className="btn btn-red attack-btn" onClick={runScan} disabled={scanning}>
              {scanning ? '⏳ Scan en cours...' : '🚨 Lancer le scan d\'API'}
            </button>

            {scanResults.length > 0 && (
              <div className="terminal" style={{ marginTop: '14px' }}>
                <div className="terminal-header">
                  <span className="terminal-dot red" /><span className="terminal-dot yellow" /><span className="terminal-dot green" />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>API Fuzzer</span>
                </div>
                <div className="terminal-body">
                  <div className="term-warn" style={{ marginBottom: '8px' }}>[*] Scan commencé — User: {user?.name} | Role: {user?.role}</div>
                  {scanResults.map((r, i) => (
                    <div key={i} style={{ marginBottom: '4px' }}>
                      <span style={{ color: 'var(--red)', fontWeight: 700 }}>[{r.status}] </span>
                      <span style={{ color: '#c9d1d9' }}>{r.ep.method} {r.ep.path}</span>
                      <span style={{ color: 'var(--yellow)' }}> ← {r.ep.desc} !!!</span>
                    </div>
                  ))}
                  {!scanning && scanResults.length === API_ENDPOINTS.length && (
                    <div className="term-err" style={{ marginTop: '8px' }}>
                      [!] {scanResults.length} endpoints admin accessibles sans permission !
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="card success" style={{ marginTop: '16px' }}>
            <div className="card-title green">🛡️ Avec vérification de fonction</div>
            <div className="input-group">
              <label>Endpoint à tester :</label>
              <select className="input-field" value={endpoint.path} onChange={e => setEndpoint(API_ENDPOINTS.find(ep => ep.path === e.target.value) ?? API_ENDPOINTS[0])}>
                {API_ENDPOINTS.map(ep => (
                  <option key={ep.path} value={ep.path}>{ep.method} {ep.path}</option>
                ))}
              </select>
            </div>
            <button className="btn btn-green" onClick={trySecure}>🛡️ Tester l'accès sécurisé</button>
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
            <div className="card-title red">❌ Endpoints sans @PreAuthorize</div>
            <div className="code-block">
              <span className="line-bad"><span className="cmt">// ❌ Aucune annotation de sécurité</span></span>
              <span className="line-bad"><span className="kw">@DeleteMapping</span>(<span className="str">{'"api/admin/patient/{id}"'}</span>)</span>
              <span className="line-bad"><span className="kw">public void</span> <span className="fn">deletePatient</span>(<span className="kw">@PathVariable</span> Long id) {'{'}</span>
              <span className="line-bad">  patientRepo.<span className="fn">deleteById</span>(id);</span>
              <span className="line-bad">{'}'}</span>
              <span className="line-normal"></span>
              <span className="line-bad"><span className="cmt">// ❌ Route accessible à tous</span></span>
              <span className="line-bad"><span className="kw">@GetMapping</span>(<span className="str">"/api/admin/audit-logs"</span>)</span>
              <span className="line-bad"><span className="kw">public</span> List{`<Log>`} <span className="fn">getLogs</span>() {'{'}</span>
              <span className="line-bad">  <span className="kw">return</span> logRepo.<span className="fn">findAll</span>();</span>
              <span className="line-bad">{'}'}</span>
            </div>
          </div>
          <div className="card success">
            <div className="card-title green">✅ Avec annotations de sécurité</div>
            <div className="code-block">
              <span className="line-good"><span className="cmt">// ✅ Sécurisé au niveau méthode</span></span>
              <span className="line-good"><span className="kw">@PreAuthorize</span>(<span className="str">"hasRole('ADMIN')"</span>)</span>
              <span className="line-good"><span className="kw">@DeleteMapping</span>(<span className="str">{'"api/admin/patient/{id}"'}</span>)</span>
              <span className="line-good"><span className="kw">public void</span> <span className="fn">deletePatient</span>(<span className="kw">@PathVariable</span> Long id) {'{'}</span>
              <span className="line-good">  patientRepo.<span className="fn">deleteById</span>(id);</span>
              <span className="line-good">{'}'}</span>
              <span className="line-normal"></span>
              <span className="line-good"><span className="cmt">// ✅ Ou configuration globale</span></span>
              <span className="line-good">.<span className="fn">requestMatchers</span>(<span className="str">"/api/admin/**"</span>)</span>
              <span className="line-good">  .<span className="fn">hasRole</span>(<span className="str">"ADMIN"</span>)</span>
              <span className="line-good">  .<span className="fn">and</span>()</span>
              <span className="line-good">.<span className="fn">anyRequest</span>().<span className="fn">denyAll</span>()</span>
            </div>
          </div>
        </div>
      )}

      {tab === 'defense' && (
        <div className="animate-in card success">
          <div className="card-title green">🛡️ Défenses contre Missing Function Level AC</div>
          <ul className="defense-list">
            <li><strong>Sécurité par défaut :</strong> Configurer <code>.anyRequest().denyAll()</code> — tout ce qui n'est pas explicitement autorisé est refusé.</li>
            <li><strong>@EnableMethodSecurity :</strong> Activer la sécurité au niveau méthode pour que @PreAuthorize fonctionne sur chaque endpoint.</li>
            <li><strong>Inventaire des endpoints :</strong> Maintenir une documentation de toutes les routes et leurs exigences d'autorisation.</li>
            <li><strong>Scan automatisé :</strong> Utiliser des outils comme OWASP ZAP ou Burp Suite en CI/CD pour détecter les endpoints non protégés.</li>
            <li><strong>Rate limiting :</strong> Limiter le nombre de requêtes pour rendre le fuzzing plus difficile.</li>
          </ul>
        </div>
      )}
    </div>
  )
}
