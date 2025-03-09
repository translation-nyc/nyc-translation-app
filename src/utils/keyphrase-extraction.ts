// import { LambdaClient, InvokeCommand, InvokeCommandOutput, InvokeCommandInput, } from "@aws-sdk/client-lambda"; 
// export interface KeyPhrase {
//   Text: string;
//   Score: number;
//   BeginOffset: number;
//   EndOffset: number;
// }
// interface DetectKeyPhrasesResponse {
//   keyPhrases: KeyPhrase[];
// }

// /**
//  * Detect key phrases in the given text using Lambda function
//  * @param text - Input text to analyze
//  * @returns Promise resolving to an array of key phrases
//  */
// export const detectKeyPhrasesEN = async (text: string, languageCode ='en'): Promise<KeyPhrase[]> => {
//   const payload = {
//     text,
//     languageCode
//   };
//   // Validate input
//   if (!text.trim()) {
//     throw new Error('Text cannot be empty');
//   }

//   try {
//     // Call the Lambda function
//     const client: LambdaClient = new LambdaClient();
//     const input: InvokeCommandInput = {
//       FunctionName: "comprehendKeyPhrases",
//       InvocationType: "Event",
//       LogType: "Tail",
//       Payload: JSON.stringify({ body: JSON.stringify(payload) }).promise()
//     }
//     const command = new InvokeCommand(input);
//     const response: InvokeCommandOutput = await client.send(command);
//     const responseBody = JSON.parse(response);
//     if (responseBody.statusCode !== 200) {
//       throw new Error(responseBody.body ? JSON.parse(responseBody.body).error : 'Lambda function error');
//     }
//     const parsedBody = JSON.parse(responseBody.body) as DetectKeyPhrasesResponse;
//     return parsedBody.keyPhrases || [];
//     // Return key phrases from the response
//     return
//   } catch (error) {
//     console.error('Key Phrases Detection Error:', error);
//     throw error;
//   }
// };

// Auth.currentCredentials()
//     .then(credentials => {
//       const lambda = new Lambda({
//         credentials: Auth.essentialCredentials(credentials)
//         region: 'eu-west-2'
//       });
//       return lambda.invoke({
//         FunctionName: 'my-function',
//         Payload: JSON.stringify({}),
//       });
//     })

// src/services/comprehendService.ts
import Auth from '@aws-amplify/auth';
import {Lambda} from '@aws-sdk/client-lambda'

export interface KeyPhrase {
  Text: string;
  Score: number;
  BeginOffset: number;
  EndOffset: number;
}

interface DetectKeyPhrasesResponse {
  keyPhrases: KeyPhrase[];
}

/**
 * Detect key phrases in the given text using Lambda function
 * @param text - Input text to analyze
 * @param languageCode - Language code for the text (default: 'en')
 * @returns Promise resolving to an array of key phrases
 */
export const detectKeyPhrasesEN = async (text: string, languageCode: string = 'en'): Promise<KeyPhrase[]> => {
  // Validate input
  if (!text.trim()) {
    throw new Error('Text cannot be empty');
  }

  try {
    // Get current credentials from Amplify Auth
    const credentials = (await Auth.fetchAuthSession()).credentials;
    
    // Initialize Lambda client with credentials
    const lambda = new Lambda({
      region: 'eu-west-2', 
      credentials: credentials
    });

    // Prepare the payload
    const payload = {
      text,
      languageCode
    };

    // Invoke Lambda function
    const response = await lambda.invoke({
      FunctionName: 'comprehendKeyPhrases', // Replace with your actual function name
      Payload: JSON.stringify({ body: JSON.stringify(payload) })
    });

    // Parse the response
    if (!response.Payload) {
      throw new Error('Empty response from Lambda function');
    }

    const responseBody = JSON.parse('');
    
    // If the Lambda returned an error
    if (responseBody.statusCode !== 200) {
      throw new Error(responseBody.body ? JSON.parse(responseBody.body).error : 'Lambda function error');
    }

    // Extract and return the key phrases
    const parsedBody = JSON.parse(responseBody.body) as DetectKeyPhrasesResponse;
    return parsedBody.keyPhrases || [];
  } catch (error) {
    console.error('Key Phrases Detection Error:', error);
    throw error;
  }
};

/**
 * Detect key phrases with support for multiple languages
 * @param text - Input text to analyze
 * @param languageCode - ISO language code (e.g., 'en', 'es', 'fr', 'de')
 */
export const detectKeyPhrases = async (text: string, languageCode: string): Promise<KeyPhrase[]> => {
  return detectKeyPhrasesEN(text, languageCode);
};