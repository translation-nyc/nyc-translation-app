import { defineAuth } from '@aws-amplify/backend';

/**
 * Define and configure your auth resource to use the existing user pool
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth/import/
 */

export const auth = defineAuth({
    loginWith: {
        email: true,
        externalProviders: {
            saml: {
                name: "MicrosoftEntraIDSAML",
                metadata: {
                    metadataType: "URL",
                    metadataContent: "https://login.microsoftonline.com/7fd93033-e7a0-483b-87b7-0796e1b212a8/federationmetadata/2007-06/federationmetadata.xml?appid=f6c28489-0284-498a-836b-5c24f7d8d4af",
                },
                attributeMapping: {
                    email: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
                },
            },
            callbackUrls: [
                'http://localhost:5173/', 
                'https://conversateapp.com/',
            ],
            logoutUrls: [
                'http://localhost:5173/',
                'https://conversateapp.com/',
            ]
        },
    },
});