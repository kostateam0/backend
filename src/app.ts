import express from "express";
import session from "express-session";
import "./jobs/updateLCKRankings";
import cors from "cors";
import passport from "passport";
import dotenv from "dotenv";
dotenv.config();
import "./jobs";
import AuthKit from "auth-kit-backend"; // ✅ 핵심


import summonerRoute from "./routes/lol/summonerRoute";
import matchRoute from "./routes/lol/matchRoute";
import leaderBoardRoute from "./routes/lol/leaderBoardRoute";

import swaggerUi from "swagger-ui-express";
import lolSwaggerSpec from "./config/swagger.lol";
import authkitSwaggerSpec from "./config/swagger.authkit";
import feeedRoute from "./routes/lol/feedRoute";
import commentsRoute from "./routes/lol/commentRoute";

// ✅ 새로 추가한 라우터들
import betRoute from "./routes/lol/betRoute";
import esportsRoute from "./routes/lol/esportsRoute";
import { PrismaClient } from "@prisma/client"; 
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: [
      'http://localhost:3000', // ✅ 웹
      'file://',               // ✅ Electron 파일 기반
    ],
    credentials: true,
  })
);
app.use(session({
  secret: "your-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,      // ❌ HTTPS 아님
    sameSite: "lax",    // Electron은 strict 사용 시 쿠키 거부
  },
}));


app.use(passport.initialize());
app.use(passport.session());

const prisma = new PrismaClient();
// 실제 API
app.use("/api/summoner", summonerRoute);
app.use("/api/match", matchRoute);
app.use("/api/lol/leaderboard", leaderBoardRoute);

// ✅ 베팅 및 e스포츠 API
app.use("/api/bet", betRoute); // 베팅 관련 API
app.use("/api/esports", esportsRoute); // ✅ 등록 완료 → /api/esports/upcoming

// ✅ AuthKit 전체 라우터를 한 번에 등록
app.use("/authkit", AuthKit(prisma)); 
// app.use("/api/user",userRoute);

// 실제 API
app.use("/api/summoner", summonerRoute);
app.use("/api/match", matchRoute);
app.use("/api/lol/leaderboard", leaderBoardRoute);

// ✅ 베팅 및 e스포츠 API
app.use("/api/bet", betRoute); // 베팅 관련 API
app.use("/api/esports", esportsRoute); // ✅ 등록 완료 → /api/esports/upcoming

// Swagger
app.use("/api/feed", feeedRoute);
app.use("/api/comment", commentsRoute);

// 🔥 LoL Swagger 라우터
const lolDocsRouter = express.Router();
lolDocsRouter.use("/", swaggerUi.serve);
lolDocsRouter.get("/", swaggerUi.setup(lolSwaggerSpec));
app.use("/docs/lol", lolDocsRouter);

// 기본
app.get("/", (req, res) => {
  res.send("Hello, Riot API 서버가 실행 중입니다.");
});

export default app;
