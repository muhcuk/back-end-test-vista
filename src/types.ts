import { Request } from "express";

export interface CreateCompanyDto {
  name: string;
  registrationNumber: string;
}

export interface CreateServiceDto {
  companyId: string;
  name: string;
  description: string;
  price: number;
}

export interface ApiError extends Error {
  statusCode?: number;
}

export type TypedRequest<T> = Request<unknown, unknown, T>;
