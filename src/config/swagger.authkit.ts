// src/config/swagger.authkit.ts
import swaggerJSDoc from "swagger-jsdoc";

const authkitSwaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AuthKit API",
      version: "1.0.0",
      description: "AuthKit 인증 관련 API 문서",
    },
  },
  apis: ["./node_modules/auth-kit-backend/dist/routes/*.js"],
});

export default authkitSwaggerSpec;
