import dotenv from 'dotenv';

dotenv.config();

export interface AIConfig {
  geminiApiKey: string;
  geminiModel: string;
  groqApiKey: string;
  groqModel: string;
  primaryProvider: string;
  fallbackProvider: string;
  timeoutMs: number;
}

export function getAIConfig(): AIConfig {
  return {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    geminiModel: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
    groqApiKey: process.env.GROQ_API_KEY || '',
    groqModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    primaryProvider: process.env.AI_PRIMARY_PROVIDER || 'gemini',
    fallbackProvider: process.env.AI_FALLBACK_PROVIDER || 'groq',
    timeoutMs: Number(process.env.AI_TIMEOUT_MS) || 45000,
  };
}

export function maskApiKey(key: string): string {
  if (!key || key.trim().length === 0) {
    return '[MISSING]';
  }
  const trimmed = key.trim();
  if (trimmed.length <= 8) {
    return '****';
  }
  return `${trimmed.slice(0, 4)}...${trimmed.slice(-4)}`;
}

export function logStartupDiagnostics(): void {
  const config = getAIConfig();
  console.log('\n====================================================');
  console.log('         AI ENGINE STARTUP DIAGNOSTICS              ');
  console.log('====================================================');
  console.log(` Primary Provider    : ${config.primaryProvider}`);
  console.log(` Primary Model       : ${config.geminiModel}`);
  console.log(` Gemini Key Exists   : ${Boolean(config.geminiApiKey)} (${maskApiKey(config.geminiApiKey)})`);
  console.log('----------------------------------------------------');
  console.log(` Fallback Provider   : ${config.fallbackProvider}`);
  console.log(` Fallback Model      : ${config.groqModel}`);
  console.log(` Groq Key Exists     : ${Boolean(config.groqApiKey)} (${maskApiKey(config.groqApiKey)})`);
  console.log('====================================================\n');
}
