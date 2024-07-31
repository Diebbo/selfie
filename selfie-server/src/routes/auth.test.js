import {describe, expect, test} from '@jest/globals';
import {sum} from './auth';

// testing the auth module
describe('auth module', () => {
  test('login', async () => {
    const result = await sum(1, 2);
    expect(result).toBe(3);
  });
});
