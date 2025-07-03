import * as z from 'zod';
import { ZodSchema } from 'zod';

export const commentSchema: ZodSchema = z.object({
  feedID: z.string(),
  content: z.string().nonempty({ message: '내용은 필수입니다.' }),
});
