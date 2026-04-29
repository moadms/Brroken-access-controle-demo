import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { PATIENTS } from '../data/patients'

type Tab = 'attack' | 'code' | 'defense'

export default function IDORDemo() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('attack')
  const [patientId, setPatientId] = useState(String(user?.id ?? 101))
  const [result, setResult] = useState<null | { ok: boolean; data?: typeof PATIENTS[0]; msg?: string }>(null)
  const [secureId, setSecureId] = useState(String(user?.id ?? 101))
  const [secureResult, setSecureResult] = useState<null | { ok: boolean; data?: typeof PATIENTS[0]; msg?: string }>(null)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (line: string) => setLogs(prev => [...prev, line])

  const attackVulnerable = () => {
    setLogs([])
    const id = Number(patientId)
    const patient = PATIENTS.find(p => p.id === id)
    addLog(`[→] GET /api/patient/${id}`)
    addLog(`[→] Authorization: Bearer ${user?.token?.slice(0, 30)}...`)
    setTimeout(() => {
      if (patient) {
        addLog(`[✓] HTTP 200 OK — Aucune vérification de propriété !`)
        addLog(`[!] Données retournées : ${JSON.stringify({ id: patient.id, name: patient.name, diagnosis: patient.diagnosis })}`)
        setResult({ ok: true, data: patient })
      } else {
        addLog(`[✗] HTTP 404 — Patient introuvable`)
        setResult({ ok: false, msg: 'Patient non trouvé' })
      }
    }, 800)
  }

  const attackSecure = () => {
    setSecureResult(null)
    const id = Number(secureId)
    const patient = PATIENTS.find(p => p.id === id)
    if (!patient) { setSecureResult({ ok: false, msg: 'Patient introuvable' }); return }
    // Secure: check ownership
    if (user?.role === 'admin' || user?.role === 'doctor' || user?.id === id) {
      setSecureResult({ ok: true, data: patient })
    } else {
      setSecureResult({ ok: false, msg: `⛔ Accès refusé — Vous (ID:${user?.id}) ne pouvez pas accéder au dossier de ID:${id}` })
    }
  }

  return (
    <div className="demo-page">
      <div className="demo-header">
        <div className="vuln-tag">🔍 OWASP A01 — CWE-639</div>
        <h2>IDOR — Insecure Direct Object Reference</h2>
        <p>L'application expose directement les identifiants de ressources sans vérifier si l'utilisateur connecté est <strong>propriétaire</strong> de la ressource demandée. Un attaquant peut simplement changer l'ID dans l'URL pour accéder aux données d'autres utilisateurs.</p>
        <div className="impact-list">
          <span className="impact-badge critical">🔴 CRITIQUE</span>
          <span className="impact-badge high">Violation de confidentialité</span>
          <span className="impact-badge high">Accès données médicales</span>
          <span className="impact-badge medium">RGPD — Sanction jusqu'à 4% CA</span>
        </div>
      </div>

      <div className="scenario-box">
        <div className="scenario-title">📋 Scénario</div>
        <strong>Alice (ID: 101)</strong> est connectée à MedSecure. Elle remarque que l'URL de son dossier est <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--yellow)' }}>/patient/101</code>. Elle change <strong>101 → 102</strong> et accède au dossier confidentiel de Bob (VIH positif).
      </div>

      <div className="tabs">
        <button className={`tab-btn ${tab === 'attack' ? 'active' : ''}`} onClick={() => setTab('attack')}>🔴 Démonstration Attaque</button>
        <button className={`tab-btn ${tab === 'code' ? 'active' : ''}`} onClick={() => setTab('code')}>💻 Code Vulnérable vs Sécurisé</button>
        <button className={`tab-btn ${tab === 'defense' ? 'active' : ''}`} onClick={() => setTab('defense')}>🛡️ Comment Sécuriser</button>
      </div>

      {tab === 'attack' && (
        <div className="animate-in">
          <div className="two-col">
            {/* Vulnerable */}
            <div className="card danger">
              <div className="card-title red">🔴 Version VULNÉRABLE</div>
              <div className="input-group">
                <label>Patient ID à cibler :</label>
                <input className="input-field danger" type="number" value={patientId} onChange={e => setPatientId(e.target.value)} />
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Vous êtes ID:{user?.id} — Essayez 102, 103, 104 (autres patients)
                </div>
              </div>
              <button className="btn btn-red attack-btn" onClick={attackVulnerable}>
                🚨 Lancer l'attaque IDOR
              </button>

              {logs.length > 0 && (
                <div className="terminal" style={{ marginTop: '14px' }}>
                  <div className="terminal-header">
                    <span className="terminal-dot red" /><span className="terminal-dot yellow" /><span className="terminal-dot green" />
                    <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>HTTP Request</span>
                  </div>
                  <div className="terminal-body">
                    {logs.map((l, i) => (
                      <div key={i} className={`term-line ${l.startsWith('[✓]') || l.startsWith('[!]') ? 'term-err' : l.startsWith('[→]') ? 'term-out' : 'term-warn'}`} style={{ marginBottom: '2px' }}>
                        {l}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result && result.ok && result.data && (
                <div className="result-box error" style={{ marginTop: '12px', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <strong>⚠️ DONNÉES VOLÉES — {result.data.name}</strong>
                  <div style={{ marginTop: '8px', fontSize: '12px', fontFamily: 'var(--font-mono)', lineHeight: '1.8' }}>
                    <div>ID: {result.data.id}</div>
                    <div>Diagnostic: {result.data.diagnosis}</div>
                    <div>Prescription: {result.data.prescription}</div>
                    {result.data.confidential && <div style={{ color: 'var(--yellow)' }}>🔒 DOSSIER CONFIDENTIEL EXPOSÉ !</div>}
                  </div>
                </div>
              )}
              {result && !result.ok && (
                <div className="result-box info" style={{ marginTop: '12px' }}>ID non trouvé dans la base</div>
              )}
            </div>

            {/* Secure */}
            <div className="card success">
              <div className="card-title green">🛡️ Version SÉCURISÉE</div>
              <div className="input-group">
                <label>Patient ID à cibler :</label>
                <input className="input-field" type="number" value={secureId} onChange={e => setSecureId(e.target.value)} />
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  L'API vérifie que vous possédez la ressource
                </div>
              </div>
              <button className="btn btn-green" onClick={attackSecure}>
                🛡️ Tenter l'accès (sécurisé)
              </button>

              {secureResult && (
                <div className={`result-box ${secureResult.ok ? 'success' : 'error'}`} style={{ marginTop: '12px', flexDirection: 'column', alignItems: 'flex-start' }}>
                  {secureResult.ok && secureResult.data ? (
                    <>
                      <strong>✅ Accès autorisé (vous êtes propriétaire)</strong>
                      <div style={{ fontSize: '12px', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                        {secureResult.data.name} — {secureResult.data.diagnosis}
                      </div>
                    </>
                  ) : (
                    <strong>{secureResult.msg}</strong>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Flow */}
          <div className="card" style={{ marginTop: '16px' }}>
            <div className="card-title blue">🔄 Flux de l'attaque IDOR</div>
            <div className="flow-diagram">
              <div className="flow-step attacker">🦹 Attaquant<br/><small>Alice (ID:101)</small></div>
              <span className="flow-arrow">→</span>
              <div className="flow-step attacker">Modifie URL<br/><small>?id=<strong>102</strong></small></div>
              <span className="flow-arrow">→</span>
              <div className="flow-step server">Serveur<br/><small>Pas de vérif.</small></div>
              <span className="flow-arrow">→</span>
              <div className="flow-step db">Base de données<br/><small>SELECT * WHERE id=102</small></div>
              <span className="flow-arrow">→</span>
              <div className="flow-step attacker">Données Bob<br/><small>VIH positif exposé !</small></div>
            </div>
          </div>
        </div>
      )}

      {tab === 'code' && (
        <div className="animate-in two-col">
          <div className="card danger">
            <div className="card-title red">❌ Code VULNÉRABLE (Java Spring)</div>
            <div className="code-block">
              <span className="line-normal"><span className="kw">@GetMapping</span>(<span className="str">{'"/api/patient/{id}"'}</span>)</span>
              <span className="line-normal"><span className="kw">public</span> Patient <span className="fn">getPatient</span>(</span>
              <span className="line-normal">    <span className="kw">@PathVariable</span> Long id,</span>
              <span className="line-normal">    HttpServletRequest req) {'{'}</span>
              <span className="line-normal"></span>
              <span className="line-bad">  <span className="cmt">// ❌ Aucune vérification de propriété !</span></span>
              <span className="line-bad">  <span className="kw">return</span> patientRepo.<span className="fn">findById</span>(id)</span>
              <span className="line-bad">    .<span className="fn">orElseThrow</span>();</span>
              <span className="line-normal">{'}'}</span>
            </div>
            <div className="result-box error" style={{ marginTop: '12px' }}>
              N'importe quel utilisateur authentifié peut accéder à N'IMPORTE quel dossier
            </div>
          </div>

          <div className="card success">
            <div className="card-title green">✅ Code SÉCURISÉ (Java Spring)</div>
            <div className="code-block">
              <span className="line-normal"><span className="kw">@GetMapping</span>(<span className="str">{'"/api/patient/{id}"'}</span>)</span>
              <span className="line-normal"><span className="kw">public</span> Patient <span className="fn">getPatient</span>(</span>
              <span className="line-normal">    <span className="kw">@PathVariable</span> Long id,</span>
              <span className="line-normal">    <span className="kw">@AuthenticationPrincipal</span> UserDetails u) {'{'}</span>
              <span className="line-normal"></span>
              <span className="line-good">  <span className="cmt">// ✅ Récupère l'utilisateur connecté</span></span>
              <span className="line-good">  User current = <span className="fn">userService</span>.findByEmail(u.<span className="fn">getUsername</span>());</span>
              <span className="line-good"></span>
              <span className="line-good">  <span className="cmt">// ✅ Vérifie la propriété ou le rôle</span></span>
              <span className="line-good">  <span className="kw">if</span> (!current.getId().<span className="fn">equals</span>(id)</span>
              <span className="line-good">      && !current.<span className="fn">hasRole</span>(<span className="str">"ADMIN"</span>)</span>
              <span className="line-good">      && !current.<span className="fn">hasRole</span>(<span className="str">"DOCTOR"</span>)) {'{'}</span>
              <span className="line-good">    <span className="kw">throw new</span> <span className="fn">AccessDeniedException</span>(<span className="str">"403"</span>);</span>
              <span className="line-good">  {'}'}</span>
              <span className="line-normal"></span>
              <span className="line-good">  <span className="kw">return</span> patientRepo.<span className="fn">findById</span>(id).<span className="fn">orElseThrow</span>();</span>
              <span className="line-normal">{'}'}</span>
            </div>
            <div className="result-box success" style={{ marginTop: '12px' }}>
              Seul le propriétaire, le médecin ou l'admin peut accéder au dossier
            </div>
          </div>
        </div>
      )}

      {tab === 'defense' && (
        <div className="animate-in">
          <div className="card success">
            <div className="card-title green">🛡️ Mesures de Défense contre l'IDOR</div>
            <ul className="defense-list">
              <li><strong>Vérification de propriété côté serveur :</strong> Toujours vérifier que l'utilisateur connecté est propriétaire de la ressource ou a un rôle autorisé — jamais se fier à l'ID en paramètre.</li>
              <li><strong>Utiliser des UUIDs :</strong> Remplacer les IDs séquentiels (101, 102...) par des UUIDs aléatoires — plus difficile à deviner.</li>
              <li><strong>Indirect object references :</strong> Mapper les IDs réels vers des références temporaires par session utilisateur.</li>
              <li><strong>Tests d'autorisation automatisés :</strong> Écrire des tests qui vérifient qu'un utilisateur A ne peut pas accéder aux données de l'utilisateur B.</li>
              <li><strong>Logging et alertes :</strong> Détecter les tentatives d'accès à des ressources non autorisées et alerter.</li>
            </ul>
          </div>
          <div className="card info" style={{ marginTop: '16px' }}>
            <div className="card-title blue">📚 Références</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              • OWASP A01:2021 — Broken Access Control<br/>
              • CWE-639: Authorization Bypass Through User-Controlled Key<br/>
              • OWASP Testing Guide — Testing for IDOR (OTG-AUTHZ-004)
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
