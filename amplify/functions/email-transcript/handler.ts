import {SendRawEmailCommand, SES} from "@aws-sdk/client-ses";
import {createTransport} from "nodemailer";
import type {Schema} from "../../data/resource";

const transporter = createTransport({
    SES: {
        ses: new SES({
            region: process.env.AWS_REGION,
        }),
        aws: {
            SendRawEmailCommand,
        },
    },
});

export const handler: Schema["emailTranscript"]["functionHandler"] = async (event) => {
    try {
        await transporter.sendMail({
            from: {
                name: "Conversate",
                address: "transcription@conversateapp.com",
            },
            to: event.arguments.email,
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
