// src/jobs/index.ts

import cron from "node-cron";
import { updateFinishedRunningMatches } from "./updateFinishedRunningMatches";

// 매 10분마다 실행
cron.schedule("*/10 * * * *", async () => {
  console.log("🔁 진행 중 경기 상태 체크 중...");
  await updateFinishedRunningMatches();
});
