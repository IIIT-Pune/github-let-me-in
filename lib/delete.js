// delete all firebase auth users
const admin = require('firebase-admin')
const serviceAccountKey = require('../serviceAccountKey.json')

async function deleteUsers() {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey),
  })

  const auth = admin.auth()

  const uidArray = (await auth.listUsers(1000)).users.map((user) => user.uid)

  auth
    .deleteUsers(uidArray)
    .then((deleteUsersResult) => {
      console.log(`Successfully deleted ${deleteUsersResult.successCount} users`)
      console.log(`Failed to delete ${deleteUsersResult.failureCount} users`)
      deleteUsersResult.errors.forEach((err) => {
        console.log(err.error.toJSON())
      })
    })
    .catch((error) => {
      console.log('Error deleting users:', error)
    })
}

deleteUsers()
