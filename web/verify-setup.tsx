/**
 * Verification script for Next.js + TypeScript setup
 * This file tests that TypeScript is properly configured
 */

import React from 'react';

// Test 1: TypeScript strict mode features
const testStrictMode = (): void => {
  const value: string = "Hello, sNAKr!";
  console.log(value);
};

// Test 2: ES2020 features (target in tsconfig)
const testES2020Features = (): void => {
  // Optional chaining
  const obj: { nested?: { value?: string } } = {};
  const result = obj?.nested?.value ?? "default";
  
  // Nullish coalescing
  const value: string | null = Math.random() > 0.5 ? null : "value";
  const fallback = value ?? "fallback";
  
  console.log({ result, fallback });
};

// Test 3: Module resolution
import type { Metadata } from 'next';

const metadata: Metadata = {
  title: 'Test',
  description: 'Testing TypeScript setup',
};

// Test 4: Path aliases (@/*)
// This would normally import from @/lib/utils but we'll just verify the type
type UtilsTest = {
  cn: (...inputs: any[]) => string;
};

// Test 5: JSX support
const TestComponent = (): React.ReactElement => {
  return <div>TypeScript + JSX working!</div>;
};

// Test 6: Async/await
const testAsync = async (): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve("Async working!"), 100);
  });
};

// Test 7: Type inference
const inferredArray = [1, 2, 3]; // Should infer number[]
const inferredObject = { name: "sNAKr", version: 1 }; // Should infer object type

// Test 8: Generics
function identity<T>(arg: T): T {
  return arg;
}

const stringResult = identity<string>("test");
const numberResult = identity<number>(42);

// Export to verify module system
export {
  testStrictMode,
  testES2020Features,
  metadata,
  TestComponent,
  testAsync,
  inferredArray,
  inferredObject,
  identity,
};

console.log("✅ TypeScript verification script compiled successfully!");
