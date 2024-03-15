import express, { Application, Request, Response } from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import { authRoutes, employeeRoutes } from "./router/routes";
import { config as dotenv } from "dotenv";

// const expressValidator = require("express-validator");

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.plugins();
    this.routes();
    dotenv();
  }

  protected routes(): void {
    this.app.get("/", (req: express.Request, res: express.Response) => {
      return res.status(200).json("Hello, TAVIA DIGITAL SOLUSI");
    });
    this.app.post("/", (req: Request, res: Response) => {
      console.log(req.body);

      return res.status(200).json(req.body);
    });

    this.app.use("/api/v1/auth", authRoutes);
    this.app.use("/api/v1/employee", employeeRoutes);
  }

  protected plugins(): void {
    this.app.use(
      cors({
        credentials: true,
      })
    );

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(compression());
    this.app.use(cookieParser());
  }
}

const port: number = 8080;
const app = new App().app;

app.listen(8080, () => {
  console.log("server running on http://localhost:8080");
});
