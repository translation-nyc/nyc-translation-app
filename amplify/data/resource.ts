import {a, type ClientSchema, defineData} from "@aws-amplify/backend";
import {emailTranscript} from "../functions/email-transcript/resource";

const schema = a.schema({
    emailTranscript: a
        .query()
        .arguments({
            transcriptParts: a.json().required(),
            comments: a.json().required(),
            font: a.string().required(),
        })
        .returns(a.json().required())
        .handler(a.handler.function(emailTranscript))
        .authorization(allow => [allow.authenticated()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
    schema,
    authorizationModes: {
        defaultAuthorizationMode: "userPool",
    },
});
