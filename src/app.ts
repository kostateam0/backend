// app.ts
import express from "express";
import session from "express-session";
import cors from "cors";
import passport from "passport";
import dotenv from "dotenv";
dotenv.config();

import authRouter from "auth-kit-backend/dist/routes/authRouter";
import userRouter from "auth-kit-backend/dist/routes/userRouter";
import adminRouter from "auth-kit-backend/dist/routes/adminRouter";
import "auth-kit-backend/dist/config/passport";

import summonerRoute from "./routes/lol/summonerRoute";
import matchRoute from "./routes/lol/matchRoute";

import swaggerUi from "swagger-ui-express";
import lolSwaggerSpec from "./config/swagger.lol";
import authkitSwaggerSpec from "./config/swagger.authkit";
import leaderBoardRoute from "./routes/lol/leaderBoardRoute";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: "your-secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// 실제 API
app.use("/api/summoner", summonerRoute);
app.use("/api/match", matchRoute);
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/admin", adminRouter);

// 🔥 LoL Swagger 라우터
const lolDocsRouter = express.Router();
lolDocsRouter.use("/", swaggerUi.serve);
lolDocsRouter.get("/", swaggerUi.setup(lolSwaggerSpec));
app.use("/docs/lol", lolDocsRouter);

// 🔥 AuthKit Swagger 라우터
// const authDocsRouter = express.Router();
// authDocsRouter.use("/", swaggerUi.serve);
// authDocsRouter.get("/", swaggerUi.setup(authkitSwaggerSpec));
// app.use("/docs/authkit", authDocsRouter);

// 기본
app.get("/", (req, res) => {
  res.send("Hello, Riot API 서버가 실행 중입니다.");
});

// API Route
app.use('/api/lol/leaderboard', leaderBoardRoute)

export default app;
