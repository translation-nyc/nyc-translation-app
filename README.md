# North Yorkshire Council Translation App

<div align="center">
    <img src="deliverables/conversate-interface.png" alt="Conversate interface" width=1000/>
</div>

---

Deployed at: https://conversateapp.com

[Demo video](https://www.youtube.com/watch?v=3KscQ6l8dik)

## Setup for development

1. Install Node.js
2. Install pnpm: `npm install -g pnpm`
3. Clone the repository
4. Copy the `amplify_outputs.json` file to the root of the project
5. Secrets Configuration
   - Obtain the private secrets file shared with you
   - Ensure the secrets file contains:
     - `MICROSOFT_ENTRA_ID_CLIENT_ID`
     - `MICROSOFT_ENTRA_ID_CLIENT_SECRET`
   - Store this file in a secure, private location
   - **Do not share or commit this file to version control**
6. Run `pnpm install` to install the dependencies

## Running the app

1. Run `pnpm dev` to start the app
2. Open the app in your browser at http://localhost:5173

## Backend sandbox setup

You can create a personal backend sandbox for yourself to develop on without interfering with the main backend instance.

1. Install the AWS CLI: https://docs.aws.amazon.com/cli/v1/userguide/cli-chap-install.html
2. Login with your IAM user credentials: https://docs.aws.amazon.com/cli/v1/userguide/cli-authentication-user.html
3. Create a new sandbox environment: `npx ampx sandbox`
   - You can delete the sandbox environment with `npx ampx sandbox delete`
   - Run `npx ampx sandbox --stream-function-logs` to get function logs
4. To add the secrets to your sandbox:
   - `npx ampx sandbox secret set MICROSOFT_ENTRA_ID_CLIENT_ID` then input value
   - `npx ampx sandbox secret set MICROSOFT_ENTRA_ID_CLIENT_SECRET` then input value

## Security Notes

- The secrets file contains sensitive credentials for Microsoft Entra ID authentication
- Keep the secrets file completely private and secure
- Never share the secrets file or its contents with anyone
- Immediately rotate credentials if the secrets file is compromised

## Testing

1. Run `pnpm test` to run tests
   - Run `pnpm coverage` to run tests with coverage. The coverage report will be generated in the `coverage` folder.

Live test coverage report can be found here: https://coverage.conversateapp.com

<div align="center">
    <img src="deliverables/test-coverage.png" alt="Test coverage" width=1000/>
</div>
