import { auth } from '@/utils/Auth'
import styles from '@/styles/Home.module.css'
import { GithubAuthProvider, GoogleAuthProvider, getAuth, linkWithPopup, signInWithPopup } from 'firebase/auth'
import Head from 'next/head'
import { useState } from 'react'

export default function Home() {
  const [loginStates, setLoginStates] = useState({
    google: '',
    github: '',
  })
  const [confetti, setConfetti] = useState(false)

  const handleGoogleLogin = () => {
    setLoginStates({
      ...loginStates,
      google: 'loading',
    })

    const provider = new GoogleAuthProvider()

    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result)
        const token = credential?.accessToken
        const user = result.user

        setLoginStates({
          ...loginStates,
          google: `Connected to ${user.displayName}` ?? '',
        })
        setConfetti(true)
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
    setConfetti(false)
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
        setConfetti(true)
      })
      .catch((error) => {
        console.log(error)
        setLoginStates({
          ...loginStates,
          google: '',
        })
      })
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
                By 0xJayesh
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
            disabled={loginStates.google !== ''}
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
            disabled={loginStates.github !== ''}
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
        </div>
      </main>
    </>
  )
}

const Spinner = () => (
  <svg
    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
)
