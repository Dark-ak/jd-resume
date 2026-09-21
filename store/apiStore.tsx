import { create } from "zustand";
import {
  type AiProvider,
  DEFAULT_PROVIDER,
  parseProvider,
} from "@/lib/aiProvider";

interface ApiStore {
  /** Visitor's own key per provider (browser-only; sent with each request, never stored server-side). */
  keys: Record<AiProvider, string>;
  setProviderKey: (provider: AiProvider, key: string) => void;
  provider: AiProvider;
  setProvider: (provider: AiProvider) => void;
}

const PROVIDER_STORAGE_KEY = "ai_provider";
// Legacy single-key storage (migrated into the gemini slot, one-time).
const LEGACY_KEYS = ["ai_api_key", "gemini_api_key"];

function keyStorageKey(provider: AiProvider): string {
  return `ai_api_key_${provider}`;
}

function emptyKeys(): Record<AiProvider, string> {
  return { gemini: "", "muse-spark": "", openrouter: "" };
}

function loadKeys(): Record<AiProvider, string> {
  const keys = emptyKeys();
  if (typeof window === "undefined") return keys;
  (Object.keys(keys) as AiProvider[]).forEach((p) => {
    keys[p] = localStorage.getItem(keyStorageKey(p)) || "";
  });
  // One-time migration: a key saved before per-provider storage
  // belongs to gemini (the only provider that existed then).
  if (!keys.gemini) {
    for (const legacy of LEGACY_KEYS) {
      const migrated = localStorage.getItem(legacy);
      if (migrated) {
        keys.gemini = migrated;
        localStorage.setItem(keyStorageKey("gemini"), migrated);
        localStorage.removeItem(legacy);
        break;
      }
    }
  }
  return keys;
}

function loadProvider(): AiProvider {
  if (typeof window === "undefined") return DEFAULT_PROVIDER;
  return parseProvider(localStorage.getItem(PROVIDER_STORAGE_KEY));
}

export const useApiStore = create<ApiStore>((set) => ({
  keys: loadKeys(),
  provider: loadProvider(),
  setProvider: (provider: AiProvider) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(PROVIDER_STORAGE_KEY, provider);
    }
    set({ provider });
  },
  setProviderKey: (provider: AiProvider, key: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(keyStorageKey(provider), key);
    }
    set((state) => ({ keys: { ...state.keys, [provider]: key } }));
  },
}));
