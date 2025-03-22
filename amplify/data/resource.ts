import {a, type ClientSchema, defineData} from "@aws-amplify/backend";
import {emailTranscript} from "../functions/email-transcript/resource";

const schema = a.schema({
    emailTranscript: a
        .query()
        .arguments({
            pdf: a.string().required(),
        })
        .returns(a.string().required())
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
