import { useAuth } from '../context/AuthContext'

interface Props {
  title: string
  subtitle: string
}

export default function Header({ title, subtitle }: Props) {
  const { user } = useAuth()

  const roleColor: Record<string, string> = {
    patient: 'patient',
    doctor: 'doctor',
    admin: 'admin',
  }

  return (
    <header className="top-header">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {user && (
        <div className="user-info">
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {user.name}
          </span>
          <span className={`role-badge ${roleColor[user.role] ?? 'patient'}`}>
            {user.role.toUpperCase()}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            ID:{user.id}
          </span>
        </div>
      )}
    </header>
  )
}
