import { createContext, useContext, useState, type ReactNode } from 'react'

export type UserRole = 'patient' | 'doctor' | 'admin'

export interface User {
  id: number
  name: string
  role: UserRole
  email: string
  token: string
}

const USERS: User[] = [
  { id: 101, name: 'Alice Martin', role: 'patient', email: 'alice@medsecure.fr', token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAxLCJyb2xlIjoicGF0aWVudCJ9.FAKE' },
  { id: 102, name: 'Bob Dupont', role: 'patient', email: 'bob@medsecure.fr', token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAyLCJyb2xlIjoicGF0aWVudCJ9.FAKE' },
  { id: 201, name: 'Dr. Claire Noir', role: 'doctor', email: 'dr.claire@medsecure.fr', token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjAxLCJyb2xlIjoiZG9jdG9yIn0.FAKE' },
  { id: 999, name: 'Admin System', role: 'admin', email: 'admin@medsecure.fr', token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OTk5LCJyb2xlIjoiYWRtaW4ifQ.FAKE' },
]

interface AuthCtx {
  user: User | null
  users: User[]
  login: (userId: number) => void
  logout: () => void
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(USERS[0])

  const login = (userId: number) => {
    const found = USERS.find(u => u.id === userId)
    if (found) setUser(found)
  }

  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, users: USERS, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
export { USERS }
