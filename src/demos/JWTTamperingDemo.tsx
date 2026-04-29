import { useState } from 'react'

type Tab = 'attack' | 'code' | 'defense'

// JWT helpers
const btoa64 = (str: string) => btoa(str).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

const makeJWT = (payload: object) => {
  const header = btoa64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const pay = btoa64(JSON.stringify(payload))
  return `${header}.${pay}.FAKE_SIGNATURE`
}

const parseJWT = (token: string) => {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload
  } catch {
    return null
  }
}

export default function JWTTamperingDemo() {
  const [tab, setTab] = useState<Tab>('attack')
  const originalToken = makeJWT({ id: 101, name: 'Alice Martin', role: 'patient', exp: 9999999999 })
  const [editablePayload, setEditablePayload] = useState(JSON.stringify({ id: 101, name: 'Alice Martin', role: 'patient', exp: 9999999999 }, null, 2))
  const [tamperedToken, setTamperedToken] = useState(originalToken)
  const [vulnResult, setVulnResult] = useState<null | { ok: boolean; msg: string; role?: string }>(null)
  const [secureResult, setSecureResult] = useState<null | { ok: boolean; msg: string }>(null)

  const updateToken = () => {
    try {
      const parsed = JSON.parse(editablePayload)
      setTamperedToken(makeJWT(parsed))
    } catch { /* ignore */ }
  }

  const sendVulnRequest = () => {
    const payload = parseJWT(tamperedToken)
    if (!payload) { setVulnResult({ ok: false, msg: 'Token invalide' }); return }
    // Vulnerable: trusts JWT payload without verifying signature
    setVulnResult({
      ok: true,
      role: payload.role,
      msg: payload.role === 'admin'
        ? `💀 ACCÈS ADMIN ACCORDÉ ! Le serveur fait confiance au payload sans vérifier la signature.`
        : `✅ Accès ${payload.role} accordé`
    })
  }

  const sendSecureRequest = () => {
    const payload = parseJWT(tamperedToken)
    if (!payload) { setSecureResult({ ok: false, msg: 'Token invalide' }); return }
    // Secure: checks signature (simulated - any tampered token fails)
    if (tamperedToken !== originalToken) {
      setSecureResult({ ok: false, msg: '⛔ Signature JWT invalide ! Tentative de falsification détectée. Le serveur rejette le token.' })
    } else {
      setSecureResult({ ok: true, msg: `✅ Signature valide — Accès ${payload.role} autorisé` })
    }
  }

  return (
    <div className="demo-page">
      <div className="demo-header">
        <div className="vuln-tag">🔑 OWASP A01 — CWE-345</div>
        <h2>JWT Tampering (Falsification de Token)</h2>
        <p>Un serveur qui ne vérifie pas la signature JWT fait confiance au payload modifié par l'attaquant. L'attaquant peut changer son rôle de <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--yellow)' }}>patient</code> à <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--red)' }}>admin</code>.</p>
        <div className="impact-list">
          <span className="impact-badge critical">🔴 CRITIQUE</span>
          <span className="impact-badge high">Usurpation d'identité</span>
          <span className="impact-badge high">Élévation de privilèges</span>
        </div>
      </div>

      <div className="scenario-box">
        <div className="scenario-title">📋 Scénario</div>
        <strong>Alice</strong> décode son JWT (c'est du Base64, pas du chiffrement !), modifie <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--yellow)' }}>"role": "patient"</code> en <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--red)' }}>"role": "admin"</code>, ré-encode et envoie. Si le serveur ne vérifie pas la signature HMAC, il accepte le token falsifié.
      </div>

      <div className="tabs">
        <button className={`tab-btn ${tab === 'attack' ? 'active' : ''}`} onClick={() => setTab('attack')}>🔴 Démonstration</button>
        <button className={`tab-btn ${tab === 'code' ? 'active' : ''}`} onClick={() => setTab('code')}>💻 Code</button>
        <button className={`tab-btn ${tab === 'defense' ? 'active' : ''}`} onClick={() => setTab('defense')}>🛡️ Défense</button>
      </div>

      {tab === 'attack' && (
        <div className="animate-in">
          <div className="card" style={{ marginBottom: '16px' }}>
            <div className="card-title blue">🔬 Structure d'un JWT</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ background: 'rgba(255,79,79,0.15)', border: '1px solid var(--red)', color: 'var(--red)', padding: '4px 10px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>HEADER</span>
              <span style={{ color: 'var(--text-muted)' }}>.</span>
              <span style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid var(--blue)', color: 'var(--blue)', padding: '4px 10px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>PAYLOAD</span>
              <span style={{ color: 'var(--text-muted)' }}>.</span>
              <span style={{ background: 'var(--green-subtle)', border: '1px solid var(--green)', color: 'var(--green)', padding: '4px 10px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>SIGNATURE</span>
            </div>
            <div className="code-block" style={{ wordBreak: 'break-all', fontSize: '11px' }}>
              <span style={{ color: 'var(--red)' }}>{originalToken.split('.')[0]}</span>
              <span style={{ color: 'var(--text-muted)' }}>.</span>
              <span style={{ color: 'var(--blue)' }}>{originalToken.split('.')[1]}</span>
              <span style={{ color: 'var(--text-muted)' }}>.</span>
              <span style={{ color: 'var(--green)' }}>FAKE_SIGNATURE</span>
            </div>
            <div className="result-box info" style={{ marginTop: '12px', fontSize: '12px' }}>
              ℹ️ Le payload JWT est encodé en Base64, pas chiffré. N'importe qui peut le lire ET le modifier !
            </div>
          </div>

          <div className="two-col">
            <div className="card danger">
              <div className="card-title red">🔴 Éditer le Payload JWT</div>
              <div className="input-group">
                <label>Modifier le payload (changez "role" en "admin") :</label>
                <textarea
                  className="input-field danger"
                  style={{ minHeight: '140px', resize: 'vertical' }}
                  value={editablePayload}
                  onChange={e => setEditablePayload(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <button className="btn btn-ghost" style={{ fontSize: '12px' }} onClick={updateToken}>🔄 Ré-encoder le JWT</button>
                <button
                  className="btn btn-ghost"
                  style={{ fontSize: '12px' }}
                  onClick={() => {
                    const admin = JSON.parse(editablePayload)
                    admin.role = 'admin'
                    setEditablePayload(JSON.stringify(admin, null, 2))
                    setTamperedToken(makeJWT(admin))
                  }}
                >
                  💉 Injecter role:admin
                </button>
              </div>
              <button className="btn btn-red attack-btn" onClick={sendVulnRequest}>🚨 Envoyer le JWT falsifié</button>
              {vulnResult && (
                <div className={`result-box ${vulnResult.role === 'admin' ? 'error' : 'success'}`} style={{ marginTop: '12px' }}>
                  {vulnResult.msg}
                </div>
              )}
            </div>

            <div className="card success">
              <div className="card-title green">🛡️ Vérification de signature</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: '1.6' }}>
                Le serveur sécurisé vérifie que la signature HMAC-SHA256 correspond au payload. Toute modification invalide le token.
              </div>
              <button className="btn btn-green" onClick={sendSecureRequest}>🛡️ Envoyer au serveur sécurisé</button>
              {secureResult && (
                <div className={`result-box ${secureResult.ok ? 'success' : 'error'}`} style={{ marginTop: '12px' }}>
                  {secureResult.msg}
                </div>
              )}
              <div className="result-box info" style={{ marginTop: '12px', fontSize: '12px' }}>
                💡 Le token original passe, le token falsifié est rejeté
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'code' && (
        <div className="animate-in two-col">
          <div className="card danger">
            <div className="card-title red">❌ Décodage sans vérification</div>
            <div className="code-block">
              <span className="line-bad"><span className="cmt">// ❌ Décode sans vérifier la signature</span></span>
              <span className="line-bad"><span className="kw">String</span>[] parts = token.<span className="fn">split</span>(<span className="str">"\\."</span>);</span>
              <span className="line-bad"><span className="kw">String</span> payload = <span className="kw">new</span> <span className="fn">String</span>(</span>
              <span className="line-bad">  Base64.<span className="fn">decode</span>(parts[<span className="num">1</span>]));</span>
              <span className="line-bad">JsonObject json = <span className="fn">parse</span>(payload);</span>
              <span className="line-bad"><span className="cmt">// Fait confiance au rôle du payload !</span></span>
              <span className="line-bad"><span className="kw">String</span> role = json.<span className="fn">get</span>(<span className="str">"role"</span>).</span>
              <span className="line-bad">  <span className="fn">getAsString</span>();</span>
            </div>
          </div>
          <div className="card success">
            <div className="card-title green">✅ Vérification HMAC correcte</div>
            <div className="code-block">
              <span className="line-good"><span className="cmt">// ✅ Spring Security JWT Filter</span></span>
              <span className="line-good"><span className="kw">public</span> Claims <span className="fn">validateToken</span>(String token) {'{'}</span>
              <span className="line-good">  <span className="kw">return</span> Jwts.<span className="fn">parserBuilder</span>()</span>
              <span className="line-good">    <span className="cmt">// Vérifie la signature avec la clé secrète</span></span>
              <span className="line-good">    .<span className="fn">setSigningKey</span>(SECRET_KEY)</span>
              <span className="line-good">    .<span className="fn">build</span>()</span>
              <span className="line-good">    .<span className="fn">parseClaimsJws</span>(token)</span>
              <span className="line-good">    .<span className="fn">getBody</span>();</span>
              <span className="line-good">  <span className="cmt">// Lance SignatureException si falsifié</span></span>
              <span className="line-good">{'}'}</span>
              <span className="line-normal"></span>
              <span className="line-good"><span className="cmt">// ✅ Clé secrète forte (256 bits min.)</span></span>
              <span className="line-good">SECRET_KEY = Keys.<span className="fn">secretKeyFor</span>(HS256);</span>
            </div>
          </div>
        </div>
      )}

      {tab === 'defense' && (
        <div className="animate-in card success">
          <div className="card-title green">🛡️ Défenses contre le JWT Tampering</div>
          <ul className="defense-list">
            <li><strong>Toujours vérifier la signature :</strong> Utiliser une bibliothèque JWT mature (JJWT, auth0-java-jwt) qui vérifie HMAC-SHA256 ou RSA.</li>
            <li><strong>Clé secrète forte :</strong> Minimum 256 bits aléatoires. Ne jamais utiliser un mot simple ou une clé codée en dur.</li>
            <li><strong>Algoritme RS256 préféré :</strong> Asymétrique — le serveur signe avec une clé privée, vérifie avec la clé publique. Plus sécurisé que HS256.</li>
            <li><strong>Rejeter "alg:none" :</strong> Certains serveurs vulnérables acceptent des tokens sans signature si alg=none. Toujours l'interdire explicitement.</li>
            <li><strong>Courte durée de vie :</strong> Tokens avec expiration courte (15min–1h) + refresh tokens sécurisés.</li>
          </ul>
        </div>
      )}
    </div>
  )
}
