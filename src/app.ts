import express from "express";
import session from "express-session";
import cors from "cors";
import passport from "passport";
import dotenv from "dotenv";
dotenv.config();

import AuthKit from "auth-kit-backend"; // ✅ 핵심

import summonerRoute from "./routes/lol/summonerRoute";
import matchRoute from "./routes/lol/matchRoute";
import leaderBoardRoute from "./routes/lol/leaderBoardRoute";

import swaggerUi from "swagger-ui-express";
import lolSwaggerSpec from "./config/swagger.lol";
import authkitSwaggerSpec from "./config/swagger.authkit";
import feeedRoute from "./routes/lol/feedRoute";


// ✅ 새로 추가한 라우터들
import betRoute from "./routes/lol/betRoute";
import esportsRoute from "./routes/lol/esportsRoute";

const app = express();
const PORT = 4000;

app.use(express.json());
app.use(
  session({
    secret: "your-secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// 실제 API
app.use("/api/summoner", summonerRoute);
app.use("/api/match", matchRoute);
app.use("/api/lol/leaderboard", leaderBoardRoute);

// ✅ 베팅 및 e스포츠 API
app.use("/api/bet", betRoute);                        // 베팅 관련 API
app.use("/api/esports", esportsRoute); // ✅ 등록 완료 → /api/esports/upcoming

// ✅ AuthKit 전체 라우터를 한 번에 등록
app.use(
  "/authkit",
  (req, res, next) => {
    console.log("✅ AuthKit 요청:", req.method, req.path);
    next();
  },
  AuthKit()
);

// Swagger
app.use('/api/feed', feeedRoute);

// 🔥 LoL Swagger 라우터
const lolDocsRouter = express.Router();
lolDocsRouter.use("/", swaggerUi.serve);
lolDocsRouter.get("/", swaggerUi.setup(lolSwaggerSpec));
app.use("/docs/lol", lolDocsRouter);

// 기본
app.get("/", (req, res) => {
  res.send("Hello, Riot API 서버가 실행 중입니다.");
});

// API Route
app.use("/api/lol/leaderboard", leaderBoardRoute);

export default app;
