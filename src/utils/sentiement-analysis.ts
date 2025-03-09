import Auth from '@aws-amplify/auth';
import {Lambda} from '@aws-sdk/client-lambda'

/**
 * Detect sentiment in the given text using Lambda function
 * @param text - Input text to analyze
 * @param languageCode - Language code for the text (default: 'en')
 * @returns Promise resolving to an array of key phrases
 */
export const detectSentimentEN = async (text: string, languageCode: string = 'en') => {
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
      FunctionName: 'comprehendSentimentDetection', // Replace with your actual function name
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
    const parsedBody = JSON.parse(responseBody.body);
    return parsedBody || [];
  } catch (error) {
    console.error('Key Phrases Detection Error:', error);
    throw error;
  }
};

