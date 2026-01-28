function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

export const env = {
  DATABASE_URL: requireEnv('DATABASE_URL'),
  JWT_SECRET: requireEnv('JWT_SECRET'),

  // OpenAI — optional at startup, validated when AI features are used
  get OPENAI_API_KEY() {
    return requireEnv('OPENAI_API_KEY');
  },
  OPENAI_EMBEDDING_MODEL: optionalEnv('OPENAI_EMBEDDING_MODEL', 'text-embedding-3-small'),
  OPENAI_CHAT_MODEL: optionalEnv('OPENAI_CHAT_MODEL', 'gpt-4o-mini'),

  // Stripe — optional at startup, validated when billing features are used
  get STRIPE_SECRET_KEY() {
    return requireEnv('STRIPE_SECRET_KEY');
  },
  get STRIPE_WEBHOOK_SECRET() {
    return requireEnv('STRIPE_WEBHOOK_SECRET');
  },
} as const;
