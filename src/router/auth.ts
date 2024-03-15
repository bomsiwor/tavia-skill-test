import express from "express";
import BaseRouter from "./baseRouter";
import authController from "../controller/authController";
import {
  validateLogin,
  validateRefreshToken,
  validateRegister,
} from "../middleware/authValidator";
import { auth } from "../middleware/authMiddleware";

class AuthRoutes extends BaseRouter {
  public routes(): void {
    this.router.post("/login", validateLogin, authController.login);
    this.router.post("/register", validateRegister, authController.register);
    this.router.post("/refresh", validateRefreshToken, authController.refresh);
    this.router.get("/activate/:token", authController.activate);
    this.router.post("/forgot-password", authController.forgot);
    this.router.get("/reset-password/:token", authController.resetInit);
    this.router.post("/reset-account", authController.resetAccount);
    this.router.post("/logout", auth, authController.logout);
    this.router.get("/me", auth, authController.me);
  }
}

export default new AuthRoutes().router;
