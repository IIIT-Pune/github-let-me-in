import { app, initializeApp } from 'firebase-admin'
import { applicationDefault } from 'firebase-admin/app'
import { Auth } from 'firebase-admin/lib/auth/auth'

export const GOOGLE_APPLICATION_CREDENTIALS = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS ?? '')

let admin: app.App | null = null,
  auth: Auth

try {
  admin = initializeApp({
    credential: applicationDefault(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  })

  auth = admin.auth()
} catch (error) {
  //   @ts-ignore
  if (!/already exists/u.test(error.message)) {
    //   @ts-ignore
    console.error('Firebase admin initialization error', error.stack)
  }
}

export default admin
export { auth }
