// import express from "express";
// const app = express();

// app.get("/", (req, res) => {
//   res.send("Hello, World!");
// });

import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import cors from "cors";
import passport from "passport";

import authRouter from "auth-kit-backend/dist/routes/authRouter";
import userRouter from "auth-kit-backend/dist/routes/userRouter";
import adminRouter from "auth-kit-backend/dist/routes/adminRouter";
import swaggerSpec from "auth-kit-backend/dist/config/swagger";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";
import "auth-kit-backend/dist/config/passport"; // ⚠️ 꼭 필요합니다
import summonerRoute from "./routes/lol/summonerRoute";

const app = express();
const PORT = 4000;
dotenv.config();

app.use(cors());
// app.use((req: Request, res: Response, next: NextFunction) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type");
//   next();
// });
app.use(express.json());
app.use("/api/summoner", summonerRoute);
app.use(
  session({
    secret: "your-secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// 미들웨어 경로 연결
app.use("/auth", authRouter); // 로그인 / 소셜 / 토큰 등
app.use("/users", userRouter); // 내 정보 수정 / 탈퇴
app.use("/admin", adminRouter); // 관리자 기능
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // Swagger 문서

export default app;
