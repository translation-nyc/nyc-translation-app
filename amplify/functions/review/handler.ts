import type { Schema } from "../../data/resource"
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

const lambda = new LambdaClient({ region: "eu-west-2" });

export const handler: Schema["review"]["functionHandler"] = async (event) => {
  
  const { email, pdf } = event.arguments

  try {

    const payload = JSON.stringify({
      body: JSON.stringify({
        email,
        pdf,
      }),
    });

    const command = new InvokeCommand({
      FunctionName: "emailTranscript", 
      Payload: Buffer.from(payload),
    });

    const response = await lambda.send(command);

    const responsePayload = JSON.parse(new TextDecoder().decode(response.Payload));

    return responsePayload;

  } catch (error) {
    return error
  }
}