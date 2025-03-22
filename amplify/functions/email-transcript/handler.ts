import {CognitoIdentityProvider} from "@aws-sdk/client-cognito-identity-provider";
import {SendRawEmailCommand, SES} from "@aws-sdk/client-ses";
import {createTransport} from "nodemailer";
import type {Schema} from "../../data/resource";

const cognito = new CognitoIdentityProvider();
const emailTransporter = createTransport({
    SES: {
        ses: new SES({
            region: process.env.AWS_REGION,
        }),
        aws: {
            SendRawEmailCommand,
        },
    },
});

// noinspection JSUnusedGlobalSymbols
export const handler: Schema["emailTranscript"]["functionHandler"] = async (event) => {
    try {
        const user = await cognito.getUser({
            AccessToken: event.request.headers.authorization,
        });
        const email = user.UserAttributes
            ?.find(attribute => attribute.Name === "email")
            ?.Value;
        if (email === undefined) {
            return JSON.stringify({
                status: "error",
                error: "User does not have an email address",
            });
        }
        await emailTransporter.sendMail({
            from: {
                name: "Conversate",
                address: "transcription@conversateapp.com",
            },
            to: email,
            subject: "Transcript",
            attachments: [
                {
                    filename: "transcript.pdf",
                    content: Buffer.from(event.arguments.pdf, "base64"),
                },
            ],
        });
        return JSON.stringify({
            status: "success",
        });
    } catch (e) {
        return JSON.stringify({
            status: "error",
            error: e,
        });
    }
};
