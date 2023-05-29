# Github Let Me In

> IIIT Pune's Github Access Granting Thingy

## Description

This is a simple web app that allows you to grant access to your Github account to the IIIT Pune Github Organization. Access is only granted to accounts that are verified to be of IIIT Pune students.

## How to use

<!-- https://iiitp-github.vercel.app/ -->

1. Go to [https://iiitp-github.vercel.app/](https://iiitp-github.vercel.app/) and follow the instructions there.
2. Check your registered email for a link to grant access to your Github account.

## How it works

`src/pages/api/invite.ts` uses Firebase to send an invite to the email address provided by the user. The email contains a link to grant access to the IIIT Pune Github Organization.

<!-- warning in red-->

**WARNING**: DO NOT CREATE NEW GITHUB ACCOUNTS BASED ON INSTITUTE EMAILS.
