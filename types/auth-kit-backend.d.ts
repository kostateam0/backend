// types/auth-kit.d.ts

declare module 'auth-kit-backend/dist/routes/authRouter' {
    import { Router } from 'express';
    const router: Router;
    export default router;
  }
  
  declare module 'auth-kit-backend/dist/routes/userRouter' {
    import { Router } from 'express';
    const router: Router;
    export default router;
  }
  
  declare module 'auth-kit-backend/dist/routes/adminRouter' {
    import { Router } from 'express';
    const router: Router;
    export default router;
  }

  // types/auth-kit-backend.d.ts
declare module 'auth-kit-backend' {
  import { PrismaClient } from '@prisma/client';
  import { Router } from 'express';

  const authKit: (prisma: PrismaClient) => Router;
  export default authKit;
}

  