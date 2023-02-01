import styles from '@/styles/Home.module.css'
import {
  Auth,
  GithubAuthProvider,
  GoogleAuthProvider,
  User,
  UserInfo,
  getAuth,
  linkWithPopup,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import Head from 'next/head'
import { useCallback, useEffect, useState } from 'react'
import Spinner from '@/components/Spinner'
import { firebaseapp } from '@/utils/Auth'

export default function Home() {
  const [curUser, setCurUser] = useState<User | null>(null)
  const [auth, setAuth] = useState<Auth | null>(null)
  const [providers, setProviders] = useState<UserInfo[] | undefined>([])
  const [loginStates, setLoginStates] = useState({
    google: '',
    github: '',
  })
  const [completed, setCompleted] = useState(false)

  const handleInviteRequest = () => {
    curUser
      ?.getIdToken(/* forceRefresh */ true)
      .then(function (idToken) {
        // post github email id to api. /invite endpoint
        fetch('/api/invite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: curUser.email,
            token: idToken,
          }),
        })
      })
      .catch(function (error) {
        console.error('error generating token', error)
      })
  }

  const handleGoogleLogin = useCallback(() => {
    if (!auth) return
    setLoginStates({
      ...loginStates,
      google: 'loading',
    })

    const provider = new GoogleAuthProvider()

    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user

        setLoginStates({
          ...loginStates,
          google: `Connected to ${user.displayName}` ?? '',
        })
      })
      .catch((error) => {
        console.log(error)
      })
  }, [auth, loginStates])

  const handleGithubLink = useCallback(async () => {
    if (!auth) return
    if (!auth.currentUser) return

    setLoginStates({
      ...loginStates,
      github: 'loading',
    })

    const githubProvider = new GithubAuthProvider()
    const linkRes = await linkWithPopup(auth.currentUser, githubProvider)
    // Accounts successfully linked.
    // const credential = GoogleAuthProvider.credentialFromResult(linkRes)
    const user = linkRes.user

    const _auth = getAuth(firebaseapp)
    setCurUser(user)
    setAuth(_auth)
    const idToken = await user.getIdToken(/* forceRefresh */ true)

    await fetch('/api/invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user?.email,
        token: idToken,
      }),
    })
      .then(() => {
        setCompleted(true)
        setLoginStates({
          ...loginStates,
          github: `Connected to ${user?.displayName}` ?? '',
        })
      })
      .catch((error) => {
        console.log(error)
        window.alert('Something went wrong. Please contact the admin.')

        setLoginStates({
          ...loginStates,
          github: '',
        })
      })
  }, [auth, loginStates])

  useEffect(() => {
    ;(async () => {
      const auth = getAuth(firebaseapp)
      setAuth(auth)
    })()
  }, [])
  useEffect(() => {
    if (auth) {
      ;(async () => {
        const { onAuthStateChanged } = await import('firebase/auth')
        onAuthStateChanged(auth, (user) => {
          setCurUser(user)
          setProviders(user?.providerData)

          setLoginStates({
            google: !!user ? 'Connected to ' + user.displayName : '',
            github: !!user?.providerData?.[1] ? 'Connected to ' + user?.providerData[1].displayName : '',
          })

          setCompleted(!!user?.providerData?.[1])

          user
            ?.getIdTokenResult()
            .then((idTokenResult) => {
              const claims = idTokenResult.claims
              console.log(claims)
              if (claims.discord_id) {
                console.log('discord is linked')
              }
            })
            .catch((error) => {
              console.log(error)
            })

          if (user) console.log('User Signed In')
          else console.log('User Signed out')
        })
      })()
    }
  }, [auth])

  return (
    <>
      <Head>
        <title>Mereko bhi andar lo - IIIT Pune</title>
        <meta
          name="description"
          content="Mereko bhi andar lo - IIIT Pune"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <link
          rel="icon"
          href="/favicon.ico"
        />
      </Head>

      <main className={styles.main}>
        {/* connected banner */}
        {completed && (
          <div className="fixed top-0 left-0 w-full text-sm bg-green-300 text-green-800 z-50 flex flex-col justify-center items-center">
            <div className="flex flex-col p-1">You&apos;re in! Check your email for the invite</div>
          </div>
        )}

        {/* header */}
        <div className="flex w-full">
          <div className={styles.description}>
            <p>Let&apos;s get you some access!</p>
            <div>
              <a
                href="https://github.com/jayeshbhole"
                target="_blank"
                rel="noopener noreferrer"
              >
                with &#128150; by 0xJayesh
              </a>
            </div>
          </div>
        </div>

        {/* buttons */}
        <div className="flex flex-col gap-8 w-[25ch] my-auto">
          {/* google login */}
          <button
            className={`inline-flex items-center justify-evenly font-semibold leading-6 text-sm shadow rounded-md transition ease-in-out duration-150
              text-white px-8 py-4 bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-60`}
            onClick={() => {
              handleGoogleLogin()
            }}
            disabled={!!curUser}
          >
            {loginStates.google === 'loading' ? (
              <>
                <Spinner />
                <span>Signing In</span>
              </>
            ) : loginStates.google === '' ? (
              <span>Login with Institute Email</span>
            ) : (
              <span>{loginStates.google}</span>
            )}
          </button>

          {/* github login */}
          <button
            className={`inline-flex items-center justify-evenly font-semibold leading-6 text-sm shadow rounded-md transition ease-in-out duration-150
              text-white px-8 py-4 bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 disabled:cursor-not-allowed disabled:opacity-60`}
            onClick={() => {
              handleGithubLink()
            }}
            disabled={!!providers?.[1] || !curUser}
          >
            {loginStates.github === 'loading' ? (
              <>
                <Spinner />
                <span>Linking Github</span>
              </>
            ) : loginStates.github === '' ? (
              <span>Link your Github Account</span>
            ) : (
              <span>{loginStates.github}</span>
            )}
          </button>

          {/* request invite button */}
          {
            <button
              className={`flex-col items-center justify-evenly font-semibold leading-6 text-sm shadow rounded-md transition ease-in-out duration-150
              hover:text-blue-500 disabled:cursor-not-allowed px-8 py-4 bg-black border-blue-500 border hidden`}
              disabled={!providers?.[1]}
              onClick={handleInviteRequest}
            >
              Request Invite
              <br />
              <span className="font-mono text-[0.625rem] font-normal">only use if you do not receive one.</span>
            </button>
          }

          {/* log out */}
          {curUser && (
            <button
              className="text-xs text-red-500 underline"
              onClick={() => {
                if (auth) {
                  signOut(auth)
                    .then(() => {
                      console.log('signed out')
                    })
                    .catch((error) => {
                      console.log(error)
                    })
                }
              }}
            >
              Log Out
            </button>
          )}
        </div>
      </main>
    </>
  )
}
