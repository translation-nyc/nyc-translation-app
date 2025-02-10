import type {Schema} from "../../data/resource";
import {env} from "$amplify/env/getTranscribeDetails";
import type {TranscribeDetails} from "./types";

// noinspection JSUnusedGlobalSymbols
export const handler: Schema["getTranscribeDetails"]["functionHandler"] = async () => {
    const details: TranscribeDetails = {
        region: process.env.AWS_REGION!,
        accessKeyId: env.TRANSCRIBE_ACCESS_KEY_ID,
        secretAccessKey: env.TRANSCRIBE_SECRET_ACCESS_KEY,
    };
    return JSON.stringify(details);
};
