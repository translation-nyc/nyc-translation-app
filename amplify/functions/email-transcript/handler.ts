import {CognitoIdentityProvider} from "@aws-sdk/client-cognito-identity-provider";
import {SendRawEmailCommand, SES} from "@aws-sdk/client-ses";
import {createTransport} from "nodemailer";
import type {Schema} from "../../data/resource";
import type {BaseTranscriptPart, Font, TranscriptComment} from "../../utils/types";
import {Languages} from "../../utils/languages";
import {createPdf} from "../../utils/transcript-pdf";
import {notoArabic} from "../../fonts/noto-arabic-normal";
import {notoChinese} from "../../fonts/noto-chinese-normal";
import {notoJapanese} from "../../fonts/noto-japanese-normal";
import {notoKorean} from "../../fonts/noto-korean-normal";

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
            return {
                status: "error",
                error: "User does not have an email address",
            };
        }
        const transcriptParts = event.arguments.transcriptParts as BaseTranscriptPart[];
        const comments = event.arguments.comments as TranscriptComment[];
        const languageCode = event.arguments.languageCode;

        const font = getFont(languageCode);
        const pdf = createPdf(transcriptParts, comments, font);
        const pdfBuffer = pdf.output("arraybuffer");

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
                    content: Buffer.from(pdfBuffer),
                },
            ],
        });
        return {
            status: "success",
        };
    } catch (e) {
        return {
            status: "error",
            error: e,
        };
    }
};

function getFont(languageCode: string): Font | undefined {
    switch (languageCode) {
        case Languages.ARABIC.transcribeCode:
            return notoArabic;
        case Languages.CHINESE.transcribeCode:
        case Languages.RUSSIAN.transcribeCode:
            return notoChinese;
        case Languages.JAPANESE.transcribeCode:
            return notoJapanese;
        case Languages.KOREAN.transcribeCode:
            return notoKorean;
        default:
            return undefined;
    }
}
