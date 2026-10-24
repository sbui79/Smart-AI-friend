// Mock implementation of expo-crypto for testing, backed by Node's global crypto

export const randomUUID = (): string => (globalThis as any).crypto.randomUUID();
