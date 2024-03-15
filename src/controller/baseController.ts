import express from "express";
import { and } from "sequelize";
export default class BaseController {
  public generateResponse = (
    status: number,
    message: string,
    data: any
  ): void => {
    express.response
      .status(status)
      .json({ code: status, message: message, data: data });
  };
}
