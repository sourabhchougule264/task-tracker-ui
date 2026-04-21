
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';
import '@testing-library/jest-dom';
import * as matchers from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';

// Extends Vitest's expect with jest-dom matchers like toBeInTheDocument
expect.extend(matchers);

// Start interception before all tests
beforeAll(() => server.listen());

// Reset handlers after each test (important so tests don't leak)
afterEach(() => server.resetHandlers());

// Shut down after all tests are done
afterAll(() => server.close());