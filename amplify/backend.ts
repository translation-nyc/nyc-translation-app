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
            "transcribe:StartStreamTranscriptionWebSocket",
            "translate:TranslateText",
            "polly:SynthesizeSpeech",
        ],
        resources: ["*"],
    })
);

backend.emailTranscript.resources.lambda.addToRolePolicy(
    new PolicyStatement({
        actions: ["ses:SendEmail", "ses:SendRawEmail"],
        resources: ['*'],
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

