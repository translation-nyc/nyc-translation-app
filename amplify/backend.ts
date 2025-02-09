import {defineBackend} from "@aws-amplify/backend";
import {PolicyStatement} from "aws-cdk-lib/aws-iam";
import {auth} from "./auth/resource";
import {data} from "./data/resource";
import {getTranscribeDetails} from "./functions/transcribe-details/resource";

const backend = defineBackend({
    auth,
    data,
    getTranscribeDetails,
});

backend.auth.resources.authenticatedUserIamRole.addToPrincipalPolicy(
    new PolicyStatement({
        actions: [
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
