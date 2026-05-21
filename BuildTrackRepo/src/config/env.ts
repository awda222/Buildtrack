/**
 * Environment configuration — reads from Expo public env vars
 */

export const ENV = {
  demoMode:
    process.env.EXPO_PUBLIC_DEMO_MODE !== 'false' &&
    process.env.EXPO_PUBLIC_DEMO_MODE !== '0',
  firebase: {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
  },
  openaiApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '',
};

/** Returns true if Firebase credentials are fully configured */
export function isFirebaseConfigured(): boolean {
  const { apiKey, projectId, appId } = ENV.firebase;
  return Boolean(apiKey && projectId && appId && !ENV.demoMode);
}

/** Returns true if OpenAI API key is set */
export function isOpenAIConfigured(): boolean {
  return Boolean(ENV.openaiApiKey && ENV.openaiApiKey !== 'your_openai_api_key');
}
