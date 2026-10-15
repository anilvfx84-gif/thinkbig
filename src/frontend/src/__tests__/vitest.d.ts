// Test-only ambient types. `vitest.setup.ts` lives outside the `src` include
// scope, so its runtime import of the jest-dom matchers does not reach the
// type-checker. Importing the same augmentation here puts the matcher types
// (`toBeInTheDocument`, `toBeChecked`, `toHaveAttribute`, ...) into the
// `vitest` module that the test files import.
import "@testing-library/jest-dom/vitest";
