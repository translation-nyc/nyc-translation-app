import {defineBackend} from "@aws-amplify/backend";
import {PolicyStatement} from "aws-cdk-lib/aws-iam";
import {auth} from "./auth/resource";

const backend = defineBackend({
    auth,
});

backend.auth.resources.authenticatedUserIamRole.addToPrincipalPolicy(
    new PolicyStatement({
        actions: [
            "translate:TranslateText",
            "speak:TextToText"
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
                textToSpeech: {
                    proxy: false,
                    region: 'eu-west-2'
                },
            },
        },
    },
});
