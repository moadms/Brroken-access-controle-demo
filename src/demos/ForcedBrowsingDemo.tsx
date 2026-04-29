import { useState } from 'react'

type Tab = 'attack' | 'code' | 'defense'

const HIDDEN_URLS = [
  { url: '/admin/backup.sql', risk: 'critical', found: true, desc: 'Dump complet de la base de données' },
  { url: '/admin/config.php', risk: 'critical', found: true, desc: 'Configuration avec credentials DB' },
  { url: '/admin/export-users.csv', risk: 'high', found: true, desc: 'Export de tous les utilisateurs' },
  { url: '/debug/phpinfo', risk: 'high', found: true, desc: 'Informations système complètes' },
  { url: '/admin/logs/access.log', risk: 'medium', found: true, desc: 'Logs d\'accès de l\'application' },
  { url: '/admin/dashboard', risk: 'critical', found: true, desc: 'Interface d\'administration' },
]

export default function ForcedBrowsingDemo() {
  const [tab, setTab] = useState<Tab>('attack')
  const [scanning, setScanning] = useState(false)
  const [foundUrls, setFoundUrls] = useState<typeof HIDDEN_URLS>([])
  const [progress, setProgress] = useState(0)

  const runFuzzer = () => {
    setScanning(true)
    setFoundUrls([])
    setProgress(0)
    HIDDEN_URLS.forEach((url, i) => {
      setTimeout(() => {
        setProgress(Math.round(((i + 1) / HIDDEN_URLS.length) * 100))
        setFoundUrls(prev => [...prev, url])
        if (i === HIDDEN_URLS.length - 1) setScanning(false)
      }, (i + 1) * 600)
    })
  }

  return (
    <div className="demo-page">
      <div className="demo-header">
        <div className="vuln-tag">🗺️ OWASP A01 — CWE-425</div>
        <h2>Forced Browsing (Énumération d'URLs)</h2>
        <p>Des ressources sensibles (fichiers de backup, pages admin, logs) sont accessibles via des URLs prévisibles mais non liées dans l'interface. Un attaquant les découvre par force brute ou en devinant.</p>
        <div className="impact-list">
          <span className="impact-badge critical">🔴 CRITIQUE</span>
          <span className="impact-badge high">Exposition de backups</span>
          <span className="impact-badge high">Accès fichiers de configuration</span>
        </div>
      </div>

      <div className="scenario-box">
        <div className="scenario-title">📋 Scénario</div>
        Un développeur a laissé <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--yellow)' }}>/admin/backup.sql</code> accessible sur le serveur. Il n'est pas dans les menus, mais <strong>Gobuster ou dirb</strong> le trouve en quelques secondes avec une wordlist.
      </div>

      <div className="tabs">
        <button className={`tab-btn ${tab === 'attack' ? 'active' : ''}`} onClick={() => setTab('attack')}>🔴 Démonstration</button>
        <button className={`tab-btn ${tab === 'code' ? 'active' : ''}`} onClick={() => setTab('code')}>💻 Code</button>
        <button className={`tab-btn ${tab === 'defense' ? 'active' : ''}`} onClick={() => setTab('defense')}>🛡️ Défense</button>
      </div>

      {tab === 'attack' && (
        <div className="animate-in">
          <div className="card danger">
            <div className="card-title red">🔴 Simulation Gobuster / dirb</div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Simulation d'un scan de répertoires. L'outil teste des centaines de chemins communs.
            </p>

            <button className="btn btn-red attack-btn" onClick={runFuzzer} disabled={scanning}>
              {scanning ? `⏳ Fuzzing... ${progress}%` : '🚨 Lancer le Fuzzer (Gobuster sim.)'}
            </button>

            {scanning && (
              <div style={{ marginTop: '12px', background: 'var(--bg-secondary)', borderRadius: '6px', height: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'var(--red)', transition: 'width 0.4s', borderRadius: '6px' }} />
              </div>
            )}

            {foundUrls.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <div className="terminal">
                  <div className="terminal-header">
                    <span className="terminal-dot red" /><span className="terminal-dot yellow" /><span className="terminal-dot green" />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>gobuster dir -u https://medsecure.fr -w common.txt</span>
                  </div>
                  <div className="terminal-body">
                    {foundUrls.map((u, i) => (
                      <div key={i} style={{ marginBottom: '4px', display: 'flex', gap: '12px' }}>
                        <span style={{ color: 'var(--red)', fontWeight: 700 }}>[200]</span>
                        <span style={{ color: u.risk === 'critical' ? 'var(--red)' : u.risk === 'high' ? 'var(--yellow)' : 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{u.url}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>← {u.desc}</span>
                      </div>
                    ))}
                    {!scanning && foundUrls.length === HIDDEN_URLS.length && (
                      <div className="term-err" style={{ marginTop: '8px' }}>
                        [!] {foundUrls.length} URLs sensibles découvertes et accessibles !
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'code' && (
        <div className="animate-in two-col">
          <div className="card danger">
            <div className="card-title red">❌ Mauvaises pratiques</div>
            <div className="code-block">
              <span className="line-bad"><span className="cmt">// ❌ Fichiers sensibles dans le répertoire public</span></span>
              <span className="line-bad">public/</span>
              <span className="line-bad">  ├── index.html</span>
              <span className="line-bad">  ├── backup.sql        ← EXPOSÉ !</span>
              <span className="line-bad">  ├── config.php        ← EXPOSÉ !</span>
              <span className="line-bad">  └── admin/</span>
              <span className="line-bad">      └── dashboard.html  ← EXPOSÉ !</span>
              <span className="line-normal"></span>
              <span className="line-bad"><span className="cmt">// ❌ Pas de .htaccess ni restriction</span></span>
              <span className="line-bad"><span className="cmt">// ❌ Listing de répertoires activé</span></span>
            </div>
          </div>
          <div className="card success">
            <div className="card-title green">✅ Bonnes pratiques</div>
            <div className="code-block">
              <span className="line-good"><span className="cmt">// ✅ Séparation public/privé</span></span>
              <span className="line-good">public/</span>
              <span className="line-good">  └── index.html</span>
              <span className="line-good">private/               ← hors webroot</span>
              <span className="line-good">  ├── backups/</span>
              <span className="line-good">  └── config/</span>
              <span className="line-normal"></span>
              <span className="line-good"><span className="cmt">// ✅ .htaccess Apache</span></span>
              <span className="line-good">Options -Indexes</span>
              <span className="line-good">{`<`}Directory /var/www/admin{`>`}</span>
              <span className="line-good">  Require role admin</span>
              <span className="line-good">{`</`}Directory{`>`}</span>
              <span className="line-normal"></span>
              <span className="line-good"><span className="cmt">// ✅ robots.txt ne révèle pas les paths</span></span>
            </div>
          </div>
        </div>
      )}

      {tab === 'defense' && (
        <div className="animate-in card success">
          <div className="card-title green">🛡️ Défenses contre le Forced Browsing</div>
          <ul className="defense-list">
            <li><strong>Répertoire webroot minimal :</strong> Placer uniquement les fichiers publics dans le répertoire web. Backups, configs, logs → hors du webroot.</li>
            <li><strong>Désactiver le listing :</strong> <code>Options -Indexes</code> dans Apache ou équivalent Nginx pour éviter de lister les fichiers.</li>
            <li><strong>Robots.txt discret :</strong> Ne pas lister les chemins sensibles dans robots.txt (les attaquants le lisent en premier).</li>
            <li><strong>Authentification sur toutes les routes admin :</strong> Même si le fichier existe, une authentification est requise.</li>
            <li><strong>Supprimer les fichiers non nécessaires :</strong> Ne jamais laisser des fichiers de backup, .sql, ou .bak sur le serveur de production.</li>
          </ul>
        </div>
      )}
    </div>
  )
}
