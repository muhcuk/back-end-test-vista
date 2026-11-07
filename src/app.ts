import cors from "cors";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { body, param } from "express-validator";
import { getPrisma } from "./prisma";
import { errorHandler, requestLogger, validateRequest } from "./middleware";
import { CreateCompanyDto, CreateServiceDto, TypedRequest } from "./types";

dotenv.config();

export const app = express();
app.use(cors());
app.use(express.json());
app.use(requestLogger);

const companyValidation = [
  body("name").isString().trim().notEmpty().withMessage("name is required"),
  body("registrationNumber")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("registrationNumber is required"),
  validateRequest,
];

const serviceValidation = [
  body("companyId").isUUID().withMessage("companyId must be a valid UUID"),
  body("name").isString().trim().notEmpty().withMessage("name is required"),
  body("description").isString().trim().notEmpty().withMessage("description is required"),
  body("price").isFloat({ min: 0 }).withMessage("price must be a non-negative number"),
  validateRequest,
];

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.post(
  "/companies",
  companyValidation,
  async (
    request: TypedRequest<CreateCompanyDto>,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const company = await getPrisma().company.create({ data: request.body });
      response.status(201).json(company);
    } catch (error) {
      next(error);
    }
  },
);

app.get("/companies", async (_request: Request, response: Response, next: NextFunction) => {
  try {
    const companies = await getPrisma().company.findMany({
      include: { services: true },
      orderBy: { name: "asc" },
    });
    response.json(companies);
  } catch (error) {
    next(error);
  }
});

app.post(
  "/services",
  serviceValidation,
  async (
    request: TypedRequest<CreateServiceDto>,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const service = await getPrisma().service.create({ data: request.body });
      response.status(201).json(service);
    } catch (error) {
      next(error);
    }
  },
);

app.get(
  "/services/:id",
  [param("id").isUUID().withMessage("id must be a valid UUID"), validateRequest],
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const serviceId = Array.isArray(request.params.id)
        ? request.params.id[0]
        : request.params.id;
      const service = await getPrisma().service.findUnique({
        where: { id: serviceId },
        include: { company: true },
      });
      if (!service) {
        response.status(404).json({ error: "Service not found" });
        return;
      }
      response.json(service);
    } catch (error) {
      next(error);
    }
  },
);

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup({
    openapi: "3.0.0",
    info: { title: "Vista Companies API", version: "1.0.0" },
    servers: [{ url: "http://localhost:3000" }],
    components: {
      schemas: {
        CreateCompany: {
          type: "object",
          required: ["name", "registrationNumber"],
          properties: {
            name: { type: "string", example: "Vista Technologies" },
            registrationNumber: { type: "string", example: "REG-001" },
          },
        },
        CreateService: {
          type: "object",
          required: ["companyId", "name", "description", "price"],
          properties: {
            companyId: { type: "string", format: "uuid" },
            name: { type: "string", example: "Web Development" },
            description: { type: "string", example: "Full-stack web development" },
            price: { type: "number", format: "float", example: 1500 },
          },
        },
      },
    },
    paths: {
      "/health": { get: { responses: { "200": { description: "API is healthy" } } } },
      "/companies": {
        get: { responses: { "200": { description: "Companies with services" } } },
        post: {
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateCompany" },
              },
            },
          },
          responses: {
            "201": { description: "Company created" },
            "400": { description: "Invalid input" },
          },
        },
      },
      "/services": {
        post: {
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateService" },
              },
            },
          },
          responses: {
            "201": { description: "Service created" },
            "400": { description: "Invalid input" },
          },
        },
      },
      "/services/{id}": {
        get: { parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }], responses: { "200": { description: "Service details" }, "404": { description: "Not found" } } },
      },
    },
  }),
);

app.use(errorHandler);
