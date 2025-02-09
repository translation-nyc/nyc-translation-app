import {defineFunction, secret} from "@aws-amplify/backend";

export const getTranscribeDetails = defineFunction({
    name: "getTranscribeDetails",
    entry: "./handler.ts",
    environment: {
        TRANSCRIBE_ACCESS_KEY_ID: secret("TRANSCRIBE_ACCESS_KEY_ID"),
        TRANSCRIBE_SECRET_ACCESS_KEY: secret("TRANSCRIBE_SECRET_ACCESS_KEY"),
    },
});
