import {defineBackend} from "@aws-amplify/backend";
import {PolicyStatement} from "aws-cdk-lib/aws-iam";
import {auth} from "./auth/resource";

const backend = defineBackend({
    auth,
});

backend.auth.resources.authenticatedUserIamRole.addToPrincipalPolicy(
    new PolicyStatement({
        actions: [
            "transcribe:StartStreamTranscriptionWebSocket",
            "translate:TranslateText",
            "polly:SynthesizeSpeech",
        ],
        resources: ["*"],
    })
);

backend.addOutput({
    custom: {
        Predictions: {
            convert: {
                transcription: {
                    proxy: false,
                    region: backend.auth.stack.region,
                },
                translateText: {
                    proxy: false,
                    region: backend.auth.stack.region,
                },
                speechGenerator: {
                    proxy: false,
                    region: backend.auth.stack.region,
                },
            },
        },
    },
});
