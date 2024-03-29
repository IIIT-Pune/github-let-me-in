import adminInstance, { auth } from 'lib/admin'
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  success?: boolean
  error?: unknown
  response?: unknown
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  try {
    const { email: userEmailId, token } = req.body
    //   receive user id from request, use firebase to get user, then use firebase to get linked github account
    //  if github account is linked, then use github api to get user's email
    // now invite user to github organization
    const GITHUB_API_TOKEN = process.env.GITHUB_API_TOKEN

    if (!auth) {
      console.error('Firebase admin not initialized')
      return res.status(500).json({ error: 'Firebase admin not initialized' })
    }
    try {
      await auth.verifyIdToken(token)
    } catch (err) {
      console.error(err)
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const user = await auth.getUserByEmail(userEmailId)
    const githubEmail = user.providerData[1].email

    const response = await fetch(`https://api.github.com/orgs/IIIT-Pune/invitations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_API_TOKEN}`,
        'X-GitHub-Api-Version': '2022-11-28',
        Accept: 'application/vnd.github+json',
        // cors headers
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        email: githubEmail,
        role: 'direct_member',
      }),
    })

    if (response?.status === 201) {
      console.log('Invitation sent', githubEmail)
      return res.status(200).json({ success: true })
    }

    console.error('Something went wrong', githubEmail, response?.statusText, response?.status, response?.body)
    return res.status(500).json({ error: 'Something went wrong', response: response })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err ?? '' })
  }
}
