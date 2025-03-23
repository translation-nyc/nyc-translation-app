import {defineFunction} from "@aws-amplify/backend";

export const emailTranscript = defineFunction({
    name: "emailTranscript",
    entry: "./handler.ts",
    timeoutSeconds: 30,
});
