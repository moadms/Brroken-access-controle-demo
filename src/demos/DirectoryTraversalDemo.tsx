import { useState } from 'react'

type Tab = 'attack' | 'code' | 'defense'

const TRAVERSAL_PATHS = [
  { path: '/files/rapport_annuel.pdf', expected: '✅ Fichier public' },
  { path: '/files/../backup/database.sql', expected: '💀 BASE DE DONNÉES ENTIÈRE !' },
  { path: '/files/../../../etc/passwd', expected: '💀 Fichier système Linux !' },
  { path: '/files/../secrets/config.env', expected: '💀 Clés API et secrets !' },
]

export default function DirectoryTraversalDemo() {
  const [tab, setTab] = useState<Tab>('attack')
  const [path, setPath] = useState('/files/rapport_annuel.pdf')
  const [vulnResult, setVulnResult] = useState<null | { ok: boolean; msg: string; data?: string }>(null)
  const [secureResult, setSecureResult] = useState<null | { ok: boolean; msg: string }>(null)

  const attackVuln = () => {
    const match = TRAVERSAL_PATHS.find(p => p.path === path)
    if (!match) {
      setVulnResult({ ok: false, msg: 'Fichier non trouvé' })
      return
    }
    if (path.includes('..')) {
      setVulnResult({ ok: true, msg: `⚠️ Contenu retourné : ${match.expected}`, data: match.expected })
    } else {
      setVulnResult({ ok: true, msg: `Fichier retourné : ${match.expected}` })
    }
  }

  const attackSecure = () => {
    const normalized = path.replace(/\.\.\//g, '').replace(/\.\.$/g, '')
    if (path.includes('..')) {
      setSecureResult({ ok: false, msg: `⛔ Tentative de traversal détectée ! Chemin normalisé : ${normalized}` })
    } else {
      setSecureResult({ ok: true, msg: `✅ Fichier servi depuis le répertoire autorisé` })
    }
  }

  return (
    <div className="demo-page">
      <div className="demo-header">
        <div className="vuln-tag">📁 OWASP A01 — CWE-22</div>
        <h2>Directory Traversal (Path Traversal)</h2>
        <p>L'application utilise directement les entrées utilisateur pour construire des chemins de fichiers. Un attaquant utilise <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--yellow)' }}>../</code> pour sortir du répertoire autorisé et accéder à des fichiers système.</p>
        <div className="impact-list">
          <span className="impact-badge critical">🔴 CRITIQUE</span>
          <span className="impact-badge high">Accès fichiers système</span>
          <span className="impact-badge high">Exposition de secrets</span>
        </div>
      </div>

      <div className="scenario-box">
        <div className="scenario-title">📋 Scénario</div>
        MedSecure permet aux patients de télécharger leurs rapports via <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--yellow)' }}>/api/files?path=rapport.pdf</code>. Un attaquant utilise <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--red)' }}>../../../etc/passwd</code> pour accéder aux fichiers système.
      </div>

      <div className="tabs">
        <button className={`tab-btn ${tab === 'attack' ? 'active' : ''}`} onClick={() => setTab('attack')}>🔴 Démonstration</button>
        <button className={`tab-btn ${tab === 'code' ? 'active' : ''}`} onClick={() => setTab('code')}>💻 Code</button>
        <button className={`tab-btn ${tab === 'defense' ? 'active' : ''}`} onClick={() => setTab('defense')}>🛡️ Défense</button>
      </div>

      {tab === 'attack' && (
        <div className="animate-in">
          <div className="card" style={{ marginBottom: '16px' }}>
            <div className="card-title blue">🎯 Sélectionner un chemin à exploiter</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {TRAVERSAL_PATHS.map(p => (
                <div
                  key={p.path}
                  onClick={() => setPath(p.path)}
                  style={{
                    padding: '10px 14px',
                    background: path === p.path ? (p.path.includes('..') ? 'var(--red-subtle)' : 'var(--green-subtle)') : 'var(--bg-secondary)',
                    border: `1px solid ${path === p.path ? (p.path.includes('..') ? 'var(--red)' : 'var(--green)') : 'var(--border)'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '13px',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', color: p.path.includes('..') ? 'var(--red)' : 'var(--green)' }}>{p.path}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.expected}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="two-col">
            <div className="card danger">
              <div className="card-title red">🔴 VULNÉRABLE</div>
              <div className="terminal" style={{ marginBottom: '12px' }}>
                <div className="terminal-header">
                  <span className="terminal-dot red" /><span className="terminal-dot yellow" /><span className="terminal-dot green" />
                </div>
                <div className="terminal-body">
                  <div className="term-out">GET /api/files?path=<span style={{ color: 'var(--red)' }}>{path}</span></div>
                  <div className="term-out">→ File.read(<span style={{ color: 'var(--red)' }}>"/var/www" + path</span>)</div>
                  {path.includes('..') && (
                    <div className="term-err">→ Résolu vers : /etc/passwd ou /backup/...</div>
                  )}
                </div>
              </div>
              <button className="btn btn-red attack-btn" onClick={attackVuln}>🚨 Télécharger le fichier</button>
              {vulnResult && (
                <div className={`result-box ${vulnResult.ok && path.includes('..') ? 'error' : 'success'}`} style={{ marginTop: '12px' }}>
                  {vulnResult.msg}
                </div>
              )}
            </div>

            <div className="card success">
              <div className="card-title green">🛡️ SÉCURISÉ</div>
              <div className="terminal" style={{ marginBottom: '12px' }}>
                <div className="terminal-header">
                  <span className="terminal-dot red" /><span className="terminal-dot yellow" /><span className="terminal-dot green" />
                </div>
                <div className="terminal-body">
                  <div className="term-ok">→ Normalise le chemin</div>
                  <div className="term-ok">→ Vérifie qu'il est dans /var/www/files/</div>
                  <div className="term-ok">→ Rejette si hors du répertoire autorisé</div>
                </div>
              </div>
              <button className="btn btn-green" onClick={attackSecure}>🛡️ Accès sécurisé</button>
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
            <div className="card-title red">❌ Code VULNÉRABLE (Java)</div>
            <div className="code-block">
              <span className="line-bad"><span className="cmt">// ❌ Chemin construit sans validation</span></span>
              <span className="line-bad"><span className="kw">@GetMapping</span>(<span className="str">"/api/files"</span>)</span>
              <span className="line-bad"><span className="kw">public</span> byte[] <span className="fn">getFile</span>(<span className="kw">@RequestParam</span> String path) {'{'}</span>
              <span className="line-bad">  String fullPath = <span className="str">"/var/www/files/"</span> + path;</span>
              <span className="line-bad">  <span className="kw">return</span> Files.<span className="fn">readAllBytes</span>(Paths.<span className="fn">get</span>(fullPath));</span>
              <span className="line-bad">{'}'}</span>
              <span className="line-normal"></span>
              <span className="line-bad"><span className="cmt">// Payload: ?path=../../../etc/passwd</span></span>
              <span className="line-bad"><span className="cmt">// Résultat: /var/www/files/../../../etc/passwd</span></span>
              <span className="line-bad"><span className="cmt">// = /etc/passwd ← EXPOSÉ !</span></span>
            </div>
          </div>
          <div className="card success">
            <div className="card-title green">✅ Code SÉCURISÉ</div>
            <div className="code-block">
              <span className="line-good"><span className="kw">@GetMapping</span>(<span className="str">"/api/files"</span>)</span>
              <span className="line-good"><span className="kw">public</span> byte[] <span className="fn">getFile</span>(<span className="kw">@RequestParam</span> String path) <span className="kw">throws</span> Exception {'{'}</span>
              <span className="line-good">  Path base = Paths.<span className="fn">get</span>(<span className="str">"/var/www/files"</span>).<span className="fn">toRealPath</span>();</span>
              <span className="line-good">  Path target = base.<span className="fn">resolve</span>(path).<span className="fn">normalize</span>();</span>
              <span className="line-good"></span>
              <span className="line-good">  <span className="cmt">// ✅ Vérifie que le chemin reste dans la base</span></span>
              <span className="line-good">  <span className="kw">if</span> (!target.<span className="fn">startsWith</span>(base)) {'{'}</span>
              <span className="line-good">    <span className="kw">throw new</span> <span className="fn">SecurityException</span>(<span className="str">"Path traversal detected"</span>);</span>
              <span className="line-good">  {'}'}</span>
              <span className="line-good"></span>
              <span className="line-good">  <span className="kw">return</span> Files.<span className="fn">readAllBytes</span>(target);</span>
              <span className="line-good">{'}'}</span>
            </div>
          </div>
        </div>
      )}

      {tab === 'defense' && (
        <div className="animate-in card success">
          <div className="card-title green">🛡️ Défenses contre le Path Traversal</div>
          <ul className="defense-list">
            <li><strong>Normalisation du chemin :</strong> Utiliser <code>Path.normalize()</code> et <code>toRealPath()</code> avant tout accès fichier.</li>
            <li><strong>Vérification de la base :</strong> S'assurer que le chemin normalisé commence par le répertoire autorisé avec <code>startsWith(base)</code>.</li>
            <li><strong>Whitelist de fichiers :</strong> Maintenir une liste des fichiers accessibles plutôt que de construire des chemins dynamiquement.</li>
            <li><strong>Stockage cloud :</strong> Utiliser S3/Azure Blob avec des URLs signées — le filesystem local n'est pas exposé.</li>
            <li><strong>Sandboxing :</strong> L'application ne doit avoir accès qu'au répertoire minimum nécessaire (principe du moindre privilège).</li>
          </ul>
        </div>
      )}
    </div>
  )
}
