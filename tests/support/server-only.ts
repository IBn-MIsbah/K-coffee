// Vitest does not resolve Next.js's server-only marker. Integration tests run in Node,
// so this no-op module preserves the import boundary without changing production code.
export {};
