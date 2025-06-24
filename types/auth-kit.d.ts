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
  