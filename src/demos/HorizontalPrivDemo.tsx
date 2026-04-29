import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { PATIENTS } from '../data/patients'

type Tab = 'attack' | 'code' | 'defense'

export default function HorizontalPrivDemo() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('attack')
  const [targetId, setTargetId] = useState('102')
  const [newDiagnosis, setNewDiagnosis] = useState('Modifié par attaquant')
  const [vulnResult, setVulnResult] = useState<null | { ok: boolean; msg: string }>(null)
  const [secureResult, setSecureResult] = useState<null | { ok: boolean; msg: string }>(null)

  const attackVuln = () => {
    const id = Number(targetId)
    const patient = PATIENTS.find(p => p.id === id)
    if (!patient) { setVulnResult({ ok: false, msg: 'Patient introuvable' }); return }
    // No ownership check = vulnerable
    setVulnResult({ ok: true, msg: `✅ MODIFIÉ ! Dossier de ${patient.name} mis à jour : "${newDiagnosis}"` })
  }

  const attackSecure = () => {
    const id = Number(targetId)
    if (user?.role === 'patient' && user.id !== id) {
      setSecureResult({ ok: false, msg: `⛔ HTTP 403 — Vous (ID:${user.id}) ne pouvez modifier que votre propre dossier` })
    } else if (user?.role === 'doctor' || user?.role === 'admin') {
      setSecureResult({ ok: true, msg: `✅ Modification autorisée — Rôle ${user.role} vérifié` })
    } else {
      setSecureResult({ ok: true, msg: '✅ Vous modifiez votre propre dossier' })
    }
  }



  return (
    <div className="demo-page">
      <div className="demo-header">
        <div className="vuln-tag">↔️ OWASP A01 — CWE-639</div>
        <h2>Élévation de Privilèges Horizontale</h2>
        <p>Deux utilisateurs ont le même niveau de privilège, mais l'un accède ou modifie les ressources de l'autre. Même rôle, mauvaise isolation des données.</p>
        <div className="impact-list">
          <span className="impact-badge critical">🔴 CRITIQUE</span>
          <span className="impact-badge high">Falsification données médicales</span>
          <span className="impact-badge high">Violation vie privée</span>
        </div>
      </div>

      <div className="scenario-box">
        <div className="scenario-title">📋 Scénario</div>
        <strong>Alice (patient ID:101)</strong> modifie la requête PUT vers <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--yellow)' }}>/api/patient/102</code> en changeant l'ID. Le serveur met à jour le dossier de Bob car il ne vérifie pas que l'utilisateur connecté = le propriétaire.
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
              <div className="card-title red">🔴 VULNÉRABLE — PUT sans vérification</div>
              <div className="input-group">
                <label>Patient ID à modifier :</label>
                <select className="input-field danger" value={targetId} onChange={e => setTargetId(e.target.value)}>
                  {PATIENTS.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.id} — {p.name} {p.id === user?.id ? '(VOUS)' : '← CIBLE'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Nouveau diagnostic (falsifié) :</label>
                <input className="input-field danger" value={newDiagnosis} onChange={e => setNewDiagnosis(e.target.value)} />
              </div>
              <div className="terminal" style={{ marginBottom: '12px' }}>
                <div className="terminal-header">
                  <span className="terminal-dot red" /><span className="terminal-dot yellow" /><span className="terminal-dot green" />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>HTTP Request</span>
                </div>
                <div className="terminal-body">
                  <div className="term-out">PUT /api/patient/<span style={{ color: 'var(--red)' }}>{targetId}</span></div>
                  <div className="term-out">Authorization: Bearer [token de {user?.name}]</div>
                  <div className="term-out">Body: {'{'}"diagnosis": "{newDiagnosis}"{'}'}</div>
                </div>
              </div>
              <button className="btn btn-red attack-btn" onClick={attackVuln}>
                🚨 Falsifier le dossier
              </button>
              {vulnResult && (
                <div className={`result-box ${vulnResult.ok ? 'error' : 'info'}`} style={{ marginTop: '12px' }}>
                  {vulnResult.msg}
                </div>
              )}
            </div>

            <div className="card success">
              <div className="card-title green">🛡️ SÉCURISÉ — Vérification propriétaire</div>
              <div className="input-group">
                <label>Patient ID à modifier :</label>
                <select className="input-field" value={targetId} onChange={e => setTargetId(e.target.value)}>
                  {PATIENTS.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.id} — {p.name} {p.id === user?.id ? '(VOUS)' : '← CIBLE'}
                    </option>
                  ))}
                </select>
              </div>
              <button className="btn btn-green" onClick={attackSecure}>
                🛡️ Tenter la modification
              </button>
              {secureResult && (
                <div className={`result-box ${secureResult.ok ? 'success' : 'error'}`} style={{ marginTop: '12px' }}>
                  {secureResult.msg}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'code' && (
        <div className="animate-in two-col">
          <div className="card danger">
            <div className="card-title red">❌ Code VULNÉRABLE</div>
            <div className="code-block">
              <span className="line-normal"><span className="kw">@PutMapping</span>(<span className="str">{'"api/patient/{id}"'}</span>)</span>
              <span className="line-normal"><span className="kw">public</span> Patient <span className="fn">updatePatient</span>(</span>
              <span className="line-normal">    <span className="kw">@PathVariable</span> Long id,</span>
              <span className="line-normal">    <span className="kw">@RequestBody</span> PatientDto dto) {'{'}</span>
              <span className="line-bad">  <span className="cmt">// ❌ Pas de vérification du propriétaire</span></span>
              <span className="line-bad">  Patient p = patientRepo.<span className="fn">findById</span>(id).<span className="fn">orElseThrow</span>();</span>
              <span className="line-bad">  p.<span className="fn">setDiagnosis</span>(dto.<span className="fn">getDiagnosis</span>());</span>
              <span className="line-bad">  <span className="kw">return</span> patientRepo.<span className="fn">save</span>(p);</span>
              <span className="line-normal">{'}'}</span>
            </div>
          </div>
          <div className="card success">
            <div className="card-title green">✅ Code SÉCURISÉ</div>
            <div className="code-block">
              <span className="line-normal"><span className="kw">@PutMapping</span>(<span className="str">{'"api/patient/{id}"'}</span>)</span>
              <span className="line-normal"><span className="kw">public</span> Patient <span className="fn">updatePatient</span>(</span>
              <span className="line-normal">    <span className="kw">@PathVariable</span> Long id,</span>
              <span className="line-normal">    <span className="kw">@RequestBody</span> PatientDto dto,</span>
              <span className="line-good">    <span className="kw">@AuthenticationPrincipal</span> UserDetails u) {'{'}</span>
              <span className="line-good"></span>
              <span className="line-good">  User current = userService.<span className="fn">findByEmail</span>(u.<span className="fn">getUsername</span>());</span>
              <span className="line-good">  Patient p = patientRepo.<span className="fn">findById</span>(id).<span className="fn">orElseThrow</span>();</span>
              <span className="line-good"></span>
              <span className="line-good">  <span className="kw">if</span> (!current.getId().<span className="fn">equals</span>(p.getId())</span>
              <span className="line-good">      && !current.<span className="fn">hasRole</span>(<span className="str">"DOCTOR"</span>)) {'{'}</span>
              <span className="line-good">    <span className="kw">throw new</span> <span className="fn">AccessDeniedException</span>(<span className="str">"403"</span>);</span>
              <span className="line-good">  {'}'}</span>
              <span className="line-good">  p.<span className="fn">setDiagnosis</span>(dto.<span className="fn">getDiagnosis</span>());</span>
              <span className="line-good">  <span className="kw">return</span> patientRepo.<span className="fn">save</span>(p);</span>
              <span className="line-normal">{'}'}</span>
            </div>
          </div>
        </div>
      )}

      {tab === 'defense' && (
        <div className="animate-in card success">
          <div className="card-title green">🛡️ Défenses contre l'Élévation Horizontale</div>
          <ul className="defense-list">
            <li>Toujours extraire l'identité de l'utilisateur du token JWT côté serveur, jamais du corps de la requête.</li>
            <li>Vérifier la propriété à chaque opération de lecture ET d'écriture (GET, PUT, DELETE).</li>
            <li>Implémenter des ACL (Access Control Lists) pour les ressources partagées entre rôles identiques.</li>
            <li>Logger toutes les tentatives d'accès inter-utilisateurs pour détection d'anomalies.</li>
          </ul>
        </div>
      )}
    </div>
  )
}
