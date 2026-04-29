import { useState } from 'react'

type Tab = 'attack' | 'code' | 'defense'

const WEAK_PASSWORDS = ['admin', 'password', '123456', 'admin123', 'default', 'root', 'test', 'qwerty']

export default function WeakPasswordDemo() {
  const [tab, setTab] = useState<Tab>('attack')
  const [password, setPassword] = useState('')
  const [attempting, setAttempting] = useState(false)
  const [tries, setTries] = useState<{ pwd: string; ok: boolean }[]>([])
  const [attempts, setAttempts] = useState(0)
  const [secureResult, setSecureResult] = useState<null | string>(null)

  const bruteForce = () => {
    setAttempting(true)
    setTries([])
    setAttempts(0)
    WEAK_PASSWORDS.forEach((pwd, i) => {
      setTimeout(() => {
        const ok = pwd === 'admin'
        setTries(prev => [...prev, { pwd, ok }])
        setAttempts(i + 1)
        if (ok) setAttempting(false)
      }, (i + 1) * 350)
    })
  }

  const tryLogin = () => {
    if (attempts >= 3) {
      setSecureResult('🔒 Compte verrouillé — Trop de tentatives (3/3). Attendez 15 minutes ou contactez l\'admin.')
    } else {
      setAttempts(prev => prev + 1)
      setSecureResult(`⛔ Identifiants incorrects (${attempts + 1}/3 tentatives) — bcrypt hash ne correspond pas`)
    }
  }

  return (
    <div className="demo-page">
      <div className="demo-header">
        <div className="vuln-tag">🔓 OWASP A01 — CWE-521</div>
        <h2>Weak / Default Passwords</h2>
        <p>Les mots de passe faibles ou par défaut (<code style={{ fontFamily: 'var(--font-mono)', color: 'var(--red)' }}>admin/admin</code>, <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--red)' }}>root/password</code>) permettent une élévation de privilèges instantanée sans aucune exploitation technique.</p>
        <div className="impact-list">
          <span className="impact-badge critical">🔴 CRITIQUE</span>
          <span className="impact-badge high">Accès total sans exploit</span>
          <span className="impact-badge medium">Brute force facile</span>
        </div>
      </div>

      <div className="scenario-box">
        <div className="scenario-title">📋 Scénario</div>
        MedSecure a un compte admin par défaut avec le mot de passe <strong>"admin"</strong>. Un attaquant essaie les mots de passe les plus courants (wordlist) et obtient l'accès en quelques secondes — aucune vulnérabilité technique nécessaire.
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
              <div className="card-title red">🔴 Brute Force — Aucune protection</div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                Simulation d'un brute force sur le compte <strong>admin</strong> avec une wordlist des mots de passe les plus courants.
              </p>
              <button className="btn btn-red attack-btn" onClick={bruteForce} disabled={attempting}>
                {attempting ? '⏳ Brute force en cours...' : '🚨 Lancer le Brute Force'}
              </button>

              {tries.length > 0 && (
                <div className="terminal" style={{ marginTop: '14px' }}>
                  <div className="terminal-header">
                    <span className="terminal-dot red" /><span className="terminal-dot yellow" /><span className="terminal-dot green" />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>Hydra / BurpSuite Intruder</span>
                  </div>
                  <div className="terminal-body">
                    <div className="term-warn" style={{ marginBottom: '6px' }}>[*] Brute forcing admin account...</div>
                    {tries.map((t, i) => (
                      <div key={i} style={{ color: t.ok ? 'var(--red)' : 'var(--text-muted)', marginBottom: '2px', fontSize: '12px' }}>
                        {t.ok ? '✓' : '✗'} admin:{t.pwd} → {t.ok ? '200 OK ← FOUND !' : '401 Unauthorized'}
                      </div>
                    ))}
                    {tries.some(t => t.ok) && (
                      <div className="term-err" style={{ marginTop: '8px' }}>
                        [SUCCESS] Credentials found: admin:admin
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="card success">
              <div className="card-title green">🛡️ Avec protection anti-brute force</div>
              <div className="input-group">
                <label>Nombre de tentatives simulées : {attempts}/3</label>
                <div style={{ background: 'var(--bg-secondary)', borderRadius: '6px', height: '6px', overflow: 'hidden', marginBottom: '12px' }}>
                  <div style={{ width: `${(attempts / 3) * 100}%`, height: '100%', background: attempts >= 3 ? 'var(--red)' : 'var(--green)', transition: 'width 0.3s' }} />
                </div>
              </div>
              <div className="input-group">
                <label>Mot de passe (essayez "admin") :</label>
                <input className="input-field" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Entrez un mot de passe..." />
              </div>
              <button className="btn btn-green" onClick={tryLogin} disabled={attempts >= 3}>
                🛡️ Tentative de connexion
              </button>
              {secureResult && (
                <div className={`result-box ${secureResult.startsWith('🔒') ? 'error' : 'error'}`} style={{ marginTop: '12px' }}>
                  {secureResult}
                </div>
              )}
              {attempts >= 3 && (
                <div className="result-box warning" style={{ marginTop: '12px' }}>
                  ⚠️ Compte verrouillé + Alerte envoyée à l'administrateur
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'code' && (
        <div className="animate-in two-col">
          <div className="card danger">
            <div className="card-title red">❌ Vulnérable</div>
            <div className="code-block">
              <span className="line-bad"><span className="cmt">// ❌ Comparaison en clair</span></span>
              <span className="line-bad"><span className="kw">if</span> (password === <span className="str">'admin'</span>) <span className="fn">login</span>(user);</span>
              <span className="line-normal"></span>
              <span className="line-bad"><span className="cmt">// ❌ Aucune limite de tentatives</span></span>
              <span className="line-bad"><span className="kw">if</span> (password === user.password) <span className="fn">login</span>();</span>
              <span className="line-normal"></span>
              <span className="line-bad"><span className="cmt">// ❌ Mot de passe par défaut en dur</span></span>
              <span className="line-bad"><span className="kw">if</span> (password === <span className="str">'admin'</span>) <span className="fn">login</span>(user);</span>
            </div>
          </div>
          <div className="card success">
            <div className="card-title green">✅ Sécurisé</div>
            <div className="code-block">
              <span className="line-good"><span className="cmt">// ✅ Hash bcrypt</span></span>
              <span className="line-good"><span className="kw">const</span> ok = <span className="kw">await</span> bcrypt.<span className="fn">compare</span>(password, user.hash);</span>
              <span className="line-normal"></span>
              <span className="line-good"><span className="cmt">// ✅ Limitation des tentatives</span></span>
              <span className="line-good"><span className="kw">if</span> (attempts {'>'} <span className="num">5</span>) <span className="fn">lockAccount</span>(user.id);</span>
              <span className="line-good"><span className="kw">if</span> (!ok) <span className="kw">return</span> <span className="num">401</span>;</span>
              <span className="line-normal"></span>
              <span className="line-good"><span className="cmt">// ✅ Spring Security config</span></span>
              <span className="line-good">PasswordEncoder encoder = <span className="kw">new</span> <span className="fn">BCryptPasswordEncoder</span>(<span className="num">12</span>);</span>
              <span className="line-good">encoder.<span className="fn">encode</span>(rawPassword);</span>
            </div>
          </div>
        </div>
      )}

      {tab === 'defense' && (
        <div className="animate-in card success">
          <div className="card-title green">🛡️ Défenses contre les Mots de Passe Faibles</div>
          <ul className="defense-list">
            <li><strong>Hashing fort :</strong> Utiliser bcrypt (coût 12+), Argon2id, ou scrypt. Jamais MD5, SHA1, ou stocker en clair.</li>
            <li><strong>Politique de mot de passe :</strong> Minimum 12 caractères, majuscules, chiffres, caractères spéciaux. Vérifier contre les wordlists courantes.</li>
            <li><strong>Rate limiting :</strong> Limiter à 5 tentatives, puis lockout progressif (5min, 15min, 1h).</li>
            <li><strong>MFA obligatoire :</strong> Authentification multi-facteurs pour tous les comptes admin.</li>
            <li><strong>Changer les mots de passe par défaut :</strong> Forcer le changement à la première connexion. Aucun mot de passe "admin" en production.</li>
          </ul>
        </div>
      )}
    </div>
  )
}
