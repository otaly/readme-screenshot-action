import { z } from 'zod';

export const userInputsSchema = z.object({
  urls: z.array(z.string().url()).nonempty(),
  width: z.coerce.number().nonnegative().default(1920),
  height: z.coerce.number().nonnegative().default(1080),
  server_command: z.string().optional(),
  server_working_dir: z.string().optional(),
  delay: z.coerce.number().nonnegative().optional(),
});

export type UserInputs = z.infer<typeof userInputsSchema>;
