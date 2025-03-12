import { defineAuth, secret } from '@aws-amplify/backend';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
    loginWith: {
        email: true,
        externalProviders: {
            oidc: [
                {
                    name: 'MicrosoftEntraID',
                    clientId: secret('MICROSOFT_ENTRA_ID_CLIENT_ID'),
                    clientSecret: secret('MICROSOFT_ENTRA_ID_CLIENT_SECRET'),
                    issuerUrl: 'https://login.microsoftonline.com/7fd93033-e7a0-483b-87b7-0796e1b212a8/v2.0',
                    scopes: ['openid', 'email', 'profile'],
                },
            ],
            callbackUrls: [
                'http://localhost:5173/', 
                'https://conversateapp.com/'
            ],
            logoutUrls: [
                'http://localhost:5173/',
                'https://conversateapp.com/'
            ]
        },
    },
});