export interface Patient {
  id: number
  name: string
  age: number
  diagnosis: string
  prescription: string
  doctorId: number
  confidential: boolean
}

export const PATIENTS: Patient[] = [
  { id: 101, name: 'Alice Martin', age: 34, diagnosis: 'Hypertension artérielle', prescription: 'Amlodipine 5mg/j', doctorId: 201, confidential: false },
  { id: 102, name: 'Bob Dupont', age: 52, diagnosis: 'Diabète de type 2 — VIH positif', prescription: 'Metformine 500mg + ARV', doctorId: 201, confidential: true },
  { id: 103, name: 'Carla Vega', age: 28, diagnosis: 'Dépression sévère', prescription: 'Sertraline 50mg/j (confidentiel)', doctorId: 201, confidential: true },
  { id: 104, name: 'David Chen', age: 61, diagnosis: 'Cancer du poumon stade II', prescription: 'Chimiothérapie FOLFOX', doctorId: 201, confidential: true },
]

export const FILES = [
  { name: 'rapport_annuel.pdf', path: '/files/rapport_annuel.pdf', public: true },
  { name: 'backup_database.sql', path: '/files/../backup/database.sql', public: false },
  { name: 'config.env', path: '/files/../../../etc/config.env', public: false },
  { name: 'passwords.txt', path: '/files/../secrets/passwords.txt', public: false },
]
