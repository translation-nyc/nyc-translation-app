import {defineBackend} from "@aws-amplify/backend";
import {PolicyStatement} from "aws-cdk-lib/aws-iam";
import {auth} from "./auth/resource";
import {data} from "./data/resource";
import {emailTranscript} from "./functions/email-transcript/resource";

const backend = defineBackend({
    auth,
    data,
    emailTranscript,
});

backend.auth.resources.authenticatedUserIamRole.addToPrincipalPolicy(
    new PolicyStatement({
        actions: [
            "comprehend:DetectKeyPhrases",
            "polly:SynthesizeSpeech",
            "transcribe:StartStreamTranscriptionWebSocket",
            "translate:TranslateText",
        ],
        resources: ["*"],
    })
);

backend.emailTranscript.resources.lambda.addToRolePolicy(
    new PolicyStatement({
        actions: [
            "ses:SendEmail",
            "ses:SendRawEmail",
        ],
        resources: ["*"],
    })
);

backend.addOutput({
    custom: {
        Predictions: {
            convert: {
                speechGenerator: {
                    proxy: false,
                    region: backend.auth.stack.region,
                },
                transcription: {
                    proxy: false,
                    region: backend.auth.stack.region,
                },
                translateText: {
                    proxy: false,
                    region: backend.auth.stack.region,
                },
            },
            interpret: {
                interpretText: {
                    proxy: false,
                    region: backend.auth.stack.region,
                },
            },
        },
    },
});
