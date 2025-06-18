// src/config/swagger.lol.ts
import swaggerJSDoc from "swagger-jsdoc";

const lolSwaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "LoL Tracker API",
      version: "1.0.0",
      description: "LoL 전적 검색 API 문서",
    },
  },
  apis: ["./src/routes/**/*.ts"],
});

export default lolSwaggerSpec;

