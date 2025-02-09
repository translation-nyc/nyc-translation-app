import {a, type ClientSchema, defineData} from "@aws-amplify/backend";
import {getTranscribeDetails} from "../functions/transcribe-details/resource";

const schema = a.schema({
    getTranscribeDetails: a
        .query()
        .returns(a.string())
        .handler(a.handler.function(getTranscribeDetails))
        .authorization((allow) => [allow.authenticated()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
    schema,
    authorizationModes: {
        defaultAuthorizationMode: "userPool",
    },
});
