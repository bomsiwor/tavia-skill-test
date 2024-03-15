import { Router } from "express";

interface IRouter {
  routes(): void;
}

export default abstract class BaseRouter implements IRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  abstract routes(): void;
}
