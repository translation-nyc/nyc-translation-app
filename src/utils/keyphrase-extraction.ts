// Lambda function (comprehend-keyphrases.ts)
import { Comprehend, DetectKeyPhrasesRequest } from "@aws-sdk/client-comprehend";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

// Initialize the Comprehend client
const comprehend = new Comprehend({ region: "eu-west-2" });

// Interface for the response
// interface KeyPhrase {
//   Text: string;
//   Score: number;
//   BeginOffset: number;
//   EndOffset: number;
// }

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Parse the request body
    const body = JSON.parse(event.body || '{}');
    const { text, languageCode = 'en' } = body;

    // Validate input
    if (!text || !text.trim()) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*", // For CORS
          "Access-Control-Allow-Headers": "*"
        },
        body: JSON.stringify({ error: "Text cannot be empty" })
      };
    }

    // Set up the Comprehend request
    const params: DetectKeyPhrasesRequest = {
      Text: text,
      LanguageCode: languageCode
    };

    // Make the API call to Comprehend
    const response = await comprehend.detectKeyPhrases(params);

    // Format the response
    const keyPhrases = (response.KeyPhrases || []).map(kp => ({
      Text: kp.Text || '',
      Score: kp.Score || 0,
      BeginOffset: kp.BeginOffset || 0,
      EndOffset: kp.EndOffset || 0
    }));

    // Return successful response
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({ keyPhrases })
    };
  } catch (error) {
    console.error("Error processing request:", error);
    
    // Return error response
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({ 
        error: "Failed to detect key phrases",
        message: (error as Error).message
      })
    };
  }
};
export const detectSentiment = async (text: string) => {
};