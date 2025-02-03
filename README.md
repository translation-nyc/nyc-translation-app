# North Yorkshire Council Translation App

## Setup

1. Install Node.js
2. Install pnpm: `npm install -g pnpm`
3. Clone the repository
4. Copy the `amplify_outputs.json` file to the root of the project
5. Run `pnpm install` to install the dependencies

## Running the app
1. Run `pnpm run dev` to start the app
2. Open the app in your browser at http://localhost:5173

## Sandbox setup

1. Install the AWS CLI: https://docs.aws.amazon.com/cli/v1/userguide/cli-chap-install.html
2. Login with your IAM user credentials: https://docs.aws.amazon.com/cli/v1/userguide/cli-authentication-user.html
3. Create a new sandbox environment: `npx ampx sandbox`
   - You can delete the sandbox environment with `npx ampx sandbox delete`
