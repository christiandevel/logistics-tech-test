import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Logistics",
      version: "1.0.0",
      description:
        "API for logistics system, manage orders and tracking orders",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Localhost",
      },
      {
        url: process.env.API_URL || "https://api.ejemplo.com",
        description: "Production",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "JWT Authorization header using the Bearer scheme. Example: `Authorization: Bearer {token}`",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);
