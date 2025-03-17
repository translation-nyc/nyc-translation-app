import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import {Lambda} from '@aws-sdk/client-lambda';

export interface KeyPhrase {
  text: string,
  beginOffset: number
}

/**
 * Detect key phrases in the given text using Lambda function
 * @param text - Input text to analyze
 * @param languageCode - Language code for the text (default: 'en')
 * @param fName - The name of the lambda function that will execute the associated comprehend function 
 * @returns Promise resolving to an array of key phrases
 */
export const comprehend = async (fName: string ,text: string, languageCode: string = 'en'): Promise<KeyPhrase[]> => {
  // Validate input
  if (!text.trim()) {
    throw new Error('Text cannot be empty');
  }

  try {
    // Get current credentials from Amplify Auth
    const region = Amplify.getConfig()
        .Predictions!
        .convert!
        .transcription!
        .region!;
    const authSession = await fetchAuthSession();
    var credentials = authSession.credentials!;
    const config = {
        region: region,
        credentials: {
            accessKeyId: credentials.accessKeyId,
            secretAccessKey: credentials.secretAccessKey,
            sessionToken: credentials.sessionToken,
        },
    };
    
    // Initialize Lambda client with credentials
    const lambda = new Lambda({
      region: 'eu-west-2', 
      credentials: config.credentials
    });

    // Prepare the payload
    const payload = {
      text,
      languageCode
    };

    // Invoke Lambda function
    const response = await lambda.invoke({
      FunctionName: fName, 
      Payload: JSON.stringify({ body: JSON.stringify(payload) })
    });

    if (!response.Payload) {
      throw new Error('Empty response from Lambda function');
    }
    
    // If the Lambda returned an error
    if (response.StatusCode !== 200) {
      throw new Error('Lambda function error');
    }

    // Extract and return the key phrases
    const parsedBody = new TextDecoder().decode(response.Payload);
    return JSON.parse(parsedBody).body;

  } catch (error) {
    console.error('Key Phrases Detection Error:', error);
    throw error;
  }
};
