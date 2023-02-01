import { Auth } from 'firebase-admin/lib/auth/auth'
import * as admin from 'firebase-admin'

let creds = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS ?? '')
export const GOOGLE_APPLICATION_CREDENTIALS = {
  ...creds,
  private_key: creds.private_key.replace(/\\n/g, '\n'),
}

let adminInstance: admin.app.App | null = null,
  auth: Auth | null = null

try {
  adminInstance = admin.initializeApp({
    credential: admin.credential.cert(GOOGLE_APPLICATION_CREDENTIALS),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  })

  auth = adminInstance.auth()
} catch (error) {
  //   @ts-ignore
  if (!/already exists/u.test(error.message)) {
    //   @ts-ignore
    console.error('Firebase admin initialization error', error.stack)
  }
}

if (!adminInstance || !auth) {
  console.error('Firebase admin/auth init error.', !!adminInstance, !!auth)
}

export default adminInstance
export { auth }
