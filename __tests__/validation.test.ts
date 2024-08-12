import { type UserInputs, userInputsSchema } from 'src/validation';

const createUserInputs = (overrides: {
  [key: string]: string | string[] | undefined;
}): Record<keyof UserInputs, string | string[] | undefined> => ({
  urls: ['http://localhost:3000'],
  width: '1280',
  height: '720',
  server_command: 'npm run dev',
  server_working_dir: 'app',
  delay: '3000',
  ...overrides,
});

describe('userInputsSchema', () => {
  describe('urls', () => {
    test.each([
      {
        urls: ['http://localhost:3000', 'http://localhost:3000/users'],
        expected: true,
      },
      { urls: [], expected: false },
      { urls: ['not url'], expected: false },
    ])(
      '入力が $urls のとき、バリデーション結果が $expected になる',
      ({ urls, expected }) => {
        const inputs = createUserInputs({
          urls,
        });
        expect(userInputsSchema.safeParse(inputs).success).toBe(expected);
      },
    );
  });

  describe('width', () => {
    test.each([
      { width: '0', expected: true },
      { width: '1', expected: true },
      { width: undefined, expected: true },
      { width: '-1', expected: false },
      { width: 'not number', expected: false },
    ])(
      '入力が $width のとき、バリデーション結果が $expected になる',
      ({ width, expected }) => {
        const inputs = createUserInputs({ width });
        expect(userInputsSchema.safeParse(inputs).success).toBe(expected);
      },
    );

    test('undefinedの場合、デフォルト値の1920が設定される', () => {
      const inputs = createUserInputs({ width: undefined });
      const result = userInputsSchema.safeParse(inputs);
      expect(result.data?.width).toBe(1920);
    });
  });

  describe('height', () => {
    test.each([
      { height: '0', expected: true },
      { height: '1', expected: true },
      { height: undefined, expected: true },
      { height: '-1', expected: false },
      { height: 'not number', expected: false },
    ])(
      '入力が $height のとき、バリデーション結果が $expected になる',
      ({ height, expected }) => {
        const inputs = createUserInputs({ height });
        expect(userInputsSchema.safeParse(inputs).success).toBe(expected);
      },
    );

    test('undefinedの場合、デフォルト値の1080が設定される', () => {
      const inputs = createUserInputs({ height: undefined });
      const result = userInputsSchema.safeParse(inputs);
      expect(result.data?.height).toBe(1080);
    });
  });

  describe('server_command', () => {
    test.each([
      { server_command: 'server command', expected: true },
      { server_command: undefined, expected: true },
    ])(
      '入力が $server_command のとき、バリデーション結果が $expected になる',
      ({ server_command, expected }) => {
        const inputs = createUserInputs({ server_command });
        expect(userInputsSchema.safeParse(inputs).success).toBe(expected);
      },
    );
  });

  describe('server_working_dir', () => {
    test.each([
      { server_working_dir: 'working_dir', expected: true },
      { server_command: undefined, expected: true },
    ])(
      '入力が $server_command のとき、バリデーション結果が $expected になる',
      ({ server_working_dir, expected }) => {
        const inputs = createUserInputs({ server_working_dir });
        expect(userInputsSchema.safeParse(inputs).success).toBe(expected);
      },
    );
  });

  describe('delay', () => {
    test.each([
      { delay: '0', expected: true },
      { delay: '1', expected: true },
      { delay: undefined, expected: true },
      { delay: '-1', expected: false },
      { delay: 'not number', expected: false },
    ])(
      '入力が $delay のとき、バリデーション結果が $expected になる',
      ({ delay, expected }) => {
        const inputs = createUserInputs({ delay });
        expect(userInputsSchema.safeParse(inputs).success).toBe(expected);
      },
    );
  });
});
