import { ComprehendClient, DetectKeyPhrasesCommand } from "@aws-sdk/client-comprehend";

interface Config {
  region: string;
}

const config: Config = {
  region: "us-west-2", // example region
};

const client: ComprehendClient = new ComprehendClient(config);

interface DetectKeyPhrasesRequest {
  Text: string;
  LanguageCode: 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ar' | 'hi' | 'ja' | 'ko' | 'zh' | 'zh-TW';
}

const input: DetectKeyPhrasesRequest = {
  Text: "STRING_VALUE",
  LanguageCode: "en",
};

const command: DetectKeyPhrasesCommand = new DetectKeyPhrasesCommand(input);

async function detectKeyPhrases(): Promise<void> {
  const response = await client.send(command);
  
  interface KeyPhrase {
    Score: number;
    Text: string;
    BeginOffset: number;
    EndOffset: number;
  }

  interface DetectKeyPhrasesResponse {
    KeyPhrases: KeyPhrase[];
  }
  
  const result: DetectKeyPhrasesResponse = response as DetectKeyPhrasesResponse;

  console.log(result.KeyPhrases);
}

detectKeyPhrases();