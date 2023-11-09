# Gameshift Dashboard

This app is under construction. Feedback highly encouraged.

Gameshift Dashboard gets new game developers over the hump by creating a useful hub where their players can register their wallet with a username and email, creating a user using the Gameshift API. 

The logic for your game can be directly embedded into this dashboard, where 'Create Asset' transactions are triggered based on points mechanisms within the game, awarding your players with tokens which can be used as currency in-game, or assets which can enhance player experience. 

Lots of planned features coming, but barebones framework is available for your pleasure. Enjoy!

# to-do

  - add button functionality
  - stylize
  - get feedback!

## Run Locally

- Head to [Gameshift](https://gameshift.solanalabs.com/) and click `Start Building` to get your Gameshift API key. 

- Add it to your `.env.template` and rename to `.env.local`

- Head to [Firebase](https://firebase.google.com/) to get started on a new project to receive your Firebase keys and add them to your `.env`

## Getting Started

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Installation

```bash
npm install
# or
yarn install
```

## Build and Run

Next, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the transaction request page by modifying `src/pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/transaction](http://localhost:3000/api/transaction). This endpoint can be edited in `src/pages/api/transaction.ts`.

