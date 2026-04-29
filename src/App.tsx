import { useState, type ReactNode } from 'react'
import { AuthProvider } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import IDORDemo from './demos/IDORDemo'
import VerticalPrivDemo from './demos/VerticalPrivDemo'
import HorizontalPrivDemo from './demos/HorizontalPrivDemo'
import ClientBypassDemo from './demos/ClientBypassDemo'
import MissingFnDemo from './demos/MissingFnDemo'
import DirectoryTraversalDemo from './demos/DirectoryTraversalDemo'
import ForcedBrowsingDemo from './demos/ForcedBrowsingDemo'
import JWTTamperingDemo from './demos/JWTTamperingDemo'
import URLMatchingDemo from './demos/URLMatchingDemo'
import SessionMgmtDemo from './demos/SessionMgmtDemo'
import SecurityObscurityDemo from './demos/SecurityObscurityDemo'
import WeakPasswordDemo from './demos/WeakPasswordDemo'
import StaleAccountsDemo from './demos/StaleAccountsDemo'
import XSSInjectionDemo from './demos/XSSInjectionDemo'

const PAGES: Record<string, { title: string; subtitle: string; component: ReactNode }> = {
  home: {
    title: '🏥 MedSecure BAC Lab',
    subtitle: 'Broken Access Control — OWASP A01:2021 — Démonstration Interactive',
    component: <HomePage onNavigate={() => {}} />,
  },
  idor: {
    title: '🔍 IDOR',
    subtitle: 'Insecure Direct Object Reference — Accès non autorisé aux ressources',
    component: <IDORDemo />,
  },
  vertical: {
    title: '⬆️ Élévation Verticale',
    subtitle: 'Accès aux fonctionnalités d\'un rôle supérieur',
    component: <VerticalPrivDemo />,
  },
  horizontal: {
    title: '↔️ Élévation Horizontale',
    subtitle: 'Modification des données d\'un utilisateur de même niveau',
    component: <HorizontalPrivDemo />,
  },
  clientbypass: {
    title: '👁️ Bypass Client-Side',
    subtitle: 'Contournement des restrictions d\'interface utilisateur',
    component: <ClientBypassDemo />,
  },
  missingfn: {
    title: '🚫 Missing Function Level AC',
    subtitle: 'Endpoints API sans vérification d\'autorisation',
    component: <MissingFnDemo />,
  },
  traversal: {
    title: '📁 Directory Traversal',
    subtitle: 'Accès aux fichiers système via manipulation de chemin',
    component: <DirectoryTraversalDemo />,
  },
  forcedbrowse: {
    title: '🗺️ Forced Browsing',
    subtitle: 'Découverte et accès à des ressources cachées',
    component: <ForcedBrowsingDemo />,
  },
  jwt: {
    title: '🔑 JWT Tampering',
    subtitle: 'Falsification du token JWT pour élévation de privilèges',
    component: <JWTTamperingDemo />,
  },
  urlmatching: {
    title: '🔀 URL Matching Violations',
    subtitle: 'Contournement par manipulation de la casse des URLs',
    component: <URLMatchingDemo />,
  },
  session: {
    title: '🍪 Insecure Session Management',
    subtitle: 'Rôle stocké côté client dans un cookie modifiable',
    component: <SessionMgmtDemo />,
  },
  obscurity: {
    title: '🙈 Security by Obscurity',
    subtitle: 'URL admin cachée mais trouvable dans le bundle JS',
    component: <SecurityObscurityDemo />,
  },
  weakpassword: {
    title: '🔓 Weak / Default Passwords',
    subtitle: 'Mot de passe par défaut permettant un brute force',
    component: <WeakPasswordDemo />,
  },
  staleaccounts: {
    title: '👥 Over-Privileged / Stale Accounts',
    subtitle: 'Comptes d\'ex-employés toujours actifs avec droits admin',
    component: <StaleAccountsDemo />,
  },
  xssinjection: {
    title: '💉 XSS & Injection Attacks',
    subtitle: 'Vol de session par XSS et bypass auth par SQLi',
    component: <XSSInjectionDemo />,
  },
}

function AppContent() {
  const [active, setActive] = useState('home')

  const navigate = (id: string) => setActive(id)
  const page = PAGES[active] ?? PAGES.home

  const component =
    active === 'home'
      ? <HomePage onNavigate={navigate} />
      : page.component

  return (
    <div className="app-layout">
      <Sidebar active={active} onChange={navigate} />
      <div className="main-content">
        <Header title={page.title} subtitle={page.subtitle} />
        {component}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
