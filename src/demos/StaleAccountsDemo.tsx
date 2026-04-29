import { useState } from 'react'

type Tab = 'attack' | 'code' | 'defense'

const STALE_ACCOUNTS = [
  { id: 1, name: 'Jean Dupont', email: 'jean.dupont@medsecure.fr', role: 'admin', leftDate: '2024-01-15', active: true, dept: 'IT' },
  { id: 2, name: 'Marie Lambert', email: 'marie.lambert@medsecure.fr', role: 'doctor', leftDate: '2024-03-20', active: true, dept: 'Médecine' },
  { id: 3, name: 'Pierre Martin', email: 'pierre.martin@medsecure.fr', role: 'admin', leftDate: '2023-11-01', active: true, dept: 'RH' },
]

export default function StaleAccountsDemo() {
  const [tab, setTab] = useState<Tab>('attack')
  const [selectedAccount, setSelectedAccount] = useState(STALE_ACCOUNTS[0])
  const [vulnResult, setVulnResult] = useState<null | string>(null)
  const [secureResult, setSecureResult] = useState<null | string>(null)

  const attackVuln = () => {
    setVulnResult(`💀 Connexion réussie en tant que ${selectedAccount.name} (${selectedAccount.role}) — Le compte est actif malgré le départ le ${selectedAccount.leftDate} !`)
  }

  const attackSecure = () => {
    setSecureResult(`⛔ Connexion refusée — Compte désactivé (departed: ${selectedAccount.leftDate}). Contactez l'administrateur.`)
  }

  return (
    <div className="demo-page">
      <div className="demo-header">
        <div className="vuln-tag">👥 OWASP A01 — CWE-269</div>
        <h2>Over-Privileged / Stale Accounts</h2>
        <p>Les comptes d'ex-employés restent actifs avec leurs droits après leur départ. Un attaquant qui obtient leurs credentials peut se connecter normalement avec des privilèges admin.</p>
        <div className="impact-list">
          <span className="impact-badge critical">🔴 CRITIQUE</span>
          <span className="impact-badge high">Accès avec compte légitime</span>
          <span className="impact-badge high">Difficile à détecter</span>
        </div>
      </div>

      <div className="scenario-box">
        <div className="scenario-title">📋 Scénario</div>
        <strong>Jean Dupont</strong>, ex-administrateur IT, a quitté MedSecure le 15/01/2024. Son compte est toujours actif avec les droits admin. Un attaquant qui obtient ses credentials (phishing, leaked DB) peut se connecter librement et accéder à tous les dossiers médicaux.
      </div>

      <div className="tabs">
        <button className={`tab-btn ${tab === 'attack' ? 'active' : ''}`} onClick={() => setTab('attack')}>🔴 Démonstration</button>
        <button className={`tab-btn ${tab === 'code' ? 'active' : ''}`} onClick={() => setTab('code')}>💻 Code</button>
        <button className={`tab-btn ${tab === 'defense' ? 'active' : ''}`} onClick={() => setTab('defense')}>🛡️ Défense</button>
      </div>

      {tab === 'attack' && (
        <div className="animate-in">
          <div className="card" style={{ marginBottom: '16px' }}>
            <div className="card-title blue">📋 Ex-employés avec comptes toujours ACTIFS</div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Rôle</th>
                  <th>Département</th>
                  <th>Date de départ</th>
                  <th>Statut compte</th>
                </tr>
              </thead>
              <tbody>
                {STALE_ACCOUNTS.map(acc => (
                  <tr
                    key={acc.id}
                    onClick={() => setSelectedAccount(acc)}
                    style={{ cursor: 'pointer' }}
                    className={selectedAccount.id === acc.id ? 'highlighted' : ''}
                  >
                    <td>{acc.name}</td>
                    <td><span style={{ color: acc.role === 'admin' ? 'var(--red)' : 'var(--blue)' }}>{acc.role}</span></td>
                    <td>{acc.dept}</td>
                    <td style={{ color: 'var(--yellow)' }}>{acc.leftDate}</td>
                    <td>
                      <span style={{ color: 'var(--red)', fontWeight: 700 }}>● ACTIF</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="two-col">
            <div className="card danger">
              <div className="card-title red">🔴 Pas de vérification du statut</div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                Connexion avec le compte de <strong>{selectedAccount.name}</strong> (a quitté le {selectedAccount.leftDate})
              </p>
              <div className="terminal" style={{ marginBottom: '12px' }}>
                <div className="terminal-header"><span className="terminal-dot red" /><span className="terminal-dot yellow" /><span className="terminal-dot green" /></div>
                <div className="terminal-body">
                  <div className="term-out">POST /api/login</div>
                  <div className="term-out">email: {selectedAccount.email}</div>
                  <div className="term-out">password: [obtenu par phishing]</div>
                  <div className="term-bad" style={{ color: 'var(--red)' }}>→ SELECT * FROM users WHERE email=? AND pwd=?</div>
                  <div className="term-bad" style={{ color: 'var(--red)' }}>→ Pas de vérification active=1 ou left_company=0</div>
                </div>
              </div>
              <button className="btn btn-red attack-btn" onClick={attackVuln}>🚨 Se connecter avec ce compte</button>
              {vulnResult && (
                <div className="result-box error" style={{ marginTop: '12px' }}>{vulnResult}</div>
              )}
            </div>

            <div className="card success">
              <div className="card-title green">🛡️ Vérification du statut actif</div>
              <div className="terminal" style={{ marginBottom: '12px' }}>
                <div className="terminal-header"><span className="terminal-dot red" /><span className="terminal-dot yellow" /><span className="terminal-dot green" /></div>
                <div className="terminal-body">
                  <div className="term-ok">SELECT * FROM users</div>
                  <div className="term-ok">WHERE email=?</div>
                  <div className="term-ok">AND pwd=?</div>
                  <div className="term-ok">AND active=1</div>
                  <div className="term-ok">AND left_company=0;</div>
                </div>
              </div>
              <button className="btn btn-green" onClick={attackSecure}>🛡️ Tenter la connexion (sécurisé)</button>
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
            <div className="card-title red">❌ Sans vérification lifecycle</div>
            <div className="code-block">
              <span className="line-bad"><span className="cmt">// ❌ Pas de vérification du statut</span></span>
              <span className="line-bad">SELECT * FROM users</span>
              <span className="line-bad">WHERE email=? AND pwd=?</span>
              <span className="line-bad"><span className="cmt">-- Compte ex-employé toujours actif !</span></span>
              <span className="line-normal"></span>
              <span className="line-bad"><span className="cmt">// ❌ Pas de processus offboarding</span></span>
              <span className="line-bad"><span className="cmt">// Droits jamais révoqués</span></span>
            </div>
          </div>
          <div className="card success">
            <div className="card-title green">✅ Avec vérification lifecycle</div>
            <div className="code-block">
              <span className="line-good"><span className="cmt">// ✅ Vérifier le statut actif</span></span>
              <span className="line-good">SELECT * FROM users</span>
              <span className="line-good">WHERE email=? AND pwd=?</span>
              <span className="line-good">AND active=1</span>
              <span className="line-good">AND left_company=0;</span>
              <span className="line-normal"></span>
              <span className="line-good"><span className="cmt">// ✅ Script offboarding automatique</span></span>
              <span className="line-good">UPDATE users SET active=0</span>
              <span className="line-good">WHERE email=? AND left_date {'<'}= NOW();</span>
            </div>
          </div>
        </div>
      )}

      {tab === 'defense' && (
        <div className="animate-in card success">
          <div className="card-title green">🛡️ Défenses contre les Stale Accounts</div>
          <ul className="defense-list">
            <li><strong>Processus offboarding immédiat :</strong> Désactiver le compte le jour du départ, avant même la fin de journée.</li>
            <li><strong>Audit régulier des comptes :</strong> Script mensuel qui désactive les comptes inactifs depuis plus de 30 jours.</li>
            <li><strong>Principe du moindre privilège :</strong> Ne donner les droits admin que le temps nécessaire. Accès temporaires avec expiration.</li>
            <li><strong>MFA pour les comptes admin :</strong> Même avec les credentials, le MFA empêche la connexion.</li>
            <li><strong>Monitoring des connexions :</strong> Alerter si un compte inactif depuis longtemps se connecte.</li>
          </ul>
        </div>
      )}
    </div>
  )
}
