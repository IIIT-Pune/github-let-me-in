import styles from '@/styles/Home.module.css'
import {
  Auth,
  GithubAuthProvider,
  GoogleAuthProvider,
  User,
  UserInfo,
  getAuth,
  getIdToken,
  linkWithPopup,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import Spinner from '@/components/Spinner'
import { firebaseConfig, firebaseapp } from '@/utils/Auth'
import OauthPopup from 'react-oauth-popup'

export default function Home() {
  const [curUser, setCurUser] = useState<User | null>(null)
  const [auth, setAuth] = useState<Auth | null>(null)
  const [providers, setProviders] = useState<UserInfo[] | undefined>([])
  const [isDiscordLinked, setIsDiscordLinked] = useState(false)

  const [loginStates, setLoginStates] = useState({
    google: '',
    github: '',
    discord: '',
  })
  const [completed, setCompleted] = useState(false)

  const handleGoogleLogin = () => {
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
        // setConfetti(true)
      })
      .catch((error) => {
        console.log(error)
        setLoginStates({
          ...loginStates,
          google: '',
        })
      })
  }

  const handleGithubLink = () => {
    if (!auth) return

    // setConfetti(false)
    setLoginStates({
      ...loginStates,
      github: 'loading',
    })

    const githubProvider = new GithubAuthProvider()

    if (!auth.currentUser) return

    linkWithPopup(auth.currentUser, githubProvider)
      .then((result) => {
        // Accounts successfully linked.
        const credential = GoogleAuthProvider.credentialFromResult(result)
        const user = result.user

        setLoginStates({
          ...loginStates,
          github: `Connected to ${user.displayName}` ?? '',
        })

        user
          .getIdToken(/* forceRefresh */ true)
          .then(function (idToken) {
            // post github email id to api. /invite endpoint
            fetch('/api/invite', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: user.email,
                token: idToken,
              }),
            })
          })
          .catch(function (error) {
            console.error('error generating token')
          })

        // setConfetti(true)
        setCompleted(true)
      })
      .catch((error) => {
        console.log(error)
        setLoginStates({
          ...loginStates,
          google: '',
        })
      })
  }

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
            github: !!providers?.[1] ? 'Connected to ' + providers[1].displayName : '',
            discord: '',
          })

          setCompleted(!!providers?.[1])

          user
            ?.getIdTokenResult()
            .then((idTokenResult) => {
              const claims = idTokenResult.claims
              if (claims.discord_id) {
                console.log('discord is linked')
                setIsDiscordLinked(true)
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
  }, [auth, providers])

  const onCode = async (code: string) => {
    // console.log("code", code);
    if (!auth?.currentUser) return

    const idToken = await getIdToken(auth?.currentUser)

    fetch('/api/discordauth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        idToken,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        console.log('res', res)
        curUser
          ?.getIdTokenResult(true)
          .then((idTokenResult) => {
            const claims = idTokenResult.claims
            console.log(claims)
            if (claims.discord_id) {
              console.log('discord linked')
              setIsDiscordLinked(true)
            }
          })
          .catch((error) => {
            console.log(error)
          })
      })
      .catch(async (err) => {
        window.alert(err.message)
        console.log('err', err)
      })
  }
  const onClose = () => {
    console.log('pop up closed')
  }

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
              text-white px-8 py-4 bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 disabled:cursor-not-allowed`}
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
              text-white px-8 py-4 bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 disabled:cursor-not-allowed`}
            onClick={() => {
              handleGithubLink()
            }}
            disabled={!!providers?.[1]}
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

          {/* discord button */}
          <OauthPopup
            url={
              'https://discord.com/api/oauth2/authorize?client_id=' +
              '909745349307019284' +
              '&redirect_uri=https%3A%2F%2Fiiitpauth.netlify.app%2F&response_type=code&scope=email%20identify%20guilds.join&state=' +
              curUser?.uid
            }
            onCode={onCode}
            onClose={onClose}
            title="Discord Login"
            width={500}
            height={500}
          >
            <button
              className={`
              inline-flex items-center justify-evenly font-semibold leading-6 text-sm shadow rounded-md transition ease-in-out duration-150
              text-white px-8 py-4 bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 disabled:cursor-not-allowed
            `}
            >
              <span>Link your Discord Account</span>
            </button>
          </OauthPopup>

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
