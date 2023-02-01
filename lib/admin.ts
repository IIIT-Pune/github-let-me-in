import { Auth } from 'firebase-admin/lib/auth/auth'
import * as admin from 'firebase-admin'

let creds = JSON.parse((process.env.SERVICE_ACCOUNT_1 as string) ?? '{}')

const serviceAccount = {
  ...creds,
  // private_key: creds.private_key.replace(/\\n/g, '\n'),
}

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  })
}

let adminInstance: admin.app.App | null = null,
  auth: Auth | null = null

try {
  adminInstance = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
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
