import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Nazarify API",
      version: "1.0.0",
      description: "Nazarify Backend API Documentation",
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
        },
      },
    },
    security: [],
  },
  apis: ["./src/routes/**/*.ts", "./src/routes/**/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);
