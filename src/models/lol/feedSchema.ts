import * as z from 'zod';
import { ZodSchema } from 'zod';

export const feedSchema: ZodSchema = z.object({
  content: z.string().nonempty({ message: '내용은 필수입니다.' }),
  imageUrl: z
    .string()
    .url({ message: '유효한 이미지 URL을 입력해주세요.' })
    .optional(),
});
