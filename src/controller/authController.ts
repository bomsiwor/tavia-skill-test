import express, { Request, Response } from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import bcrypt, { hash } from "bcrypt";
import Authentication from "../util/authentication";
import BaseController from "./baseController";
import { generateTimeAfter, randomString } from "../util";
import multer, { StorageEngine } from "multer";
import path from "path";
const db = require("../db/model/model.js");

dotenv.config();

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

const transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

// Global function for sending email
// Maybe it will drive to race condition ?
const sendActivationEmail = async (mailData: any) => {
  // Send activation email
  let info = await transporter.sendMail(mailData);

  console.log("Activation email sent: %s", info.messageId);
};

class AuthController extends BaseController {
  async login(req: express.Request, res: express.Response) {
    try {
      const reqData: LoginRequest = req.body;

      const user = await db.User.findOne({
        where: { email: reqData.email },
        attributes: ["id", "email", "password"],
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      //  Check password
      let checkPassword = await Authentication.passwordCheck(
        reqData.password,
        user.password
      );
      if (!checkPassword) {
        return res.status(404).json({ message: "Credential not valid" });
      }

      // Check max number of device
      // Throw error if device exceeded
      const countDevice = await db.OauthAccessToken.count({
        where: { user_id: user.id },
      });
      if (countDevice > 3) {
        return res.status(400).json({ message: "Max device exceeded" });
      }

      // Generate token, refresh token
      // Store the token in database
      // The token stored in database in order to revocation in future / session management
      const token = Authentication.generateToken({ sub: user.id });
      const refreshToken = randomString();
      const maxRefreshToken = generateTimeAfter(3 * 24 * 60);

      let accessToken = await user.createOauthAccessToken({ token: token });
      let refreshTokenData = await accessToken.createOauthRefreshToken({
        token: refreshToken,
        expired_at: maxRefreshToken,
      });

      return res.status(200).json({
        token: token,
        refreshToken: refreshToken,
        user: user.id,
      });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400).end();
    }
  }

  // Controller function to handle user registration
  async register(req: express.Request, res: express.Response) {
    try {
      // Extract user data from request body
      const registerRequest: RegisterRequest = req.body;

      // Check if email already exists
      const existingUser = await db.User.findOne({
        where: { email: registerRequest.email },
        attributes: ["id"],
      });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Hash the password
      const hashedPassword = await Authentication.passwordHash(
        registerRequest.password
      );
      // Create new user
      const newUser = await db.User.create({
        name: registerRequest.name,
        email: registerRequest.email,
        password: hashedPassword,
      });

      const emailToken = randomString();
      console.log(emailToken);

      const mailData = {
        from: '"Aplikasi 1" <noreply@aplikasi1.com>',
        to: registerRequest.email,
        subject: "Activate Your Account",
        text: "Please click the following link to activate your account: http://localhost:8080/activate",
        html: `<p>Please click the following link to activate your account: <a href="http://localhost:8080/activate/${emailToken}">Activate</a></p>`,
      };
      // // Send activation email
      await sendActivationEmail(mailData);

      newUser.email_token = emailToken;
      await newUser.save();

      // // Respond with success message
      res.status(201).json({
        message: "User registered successfully. Activation email sent.",
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  }

  // Handle refresh token
  async refresh(req: express.Request, res: express.Response) {
    try {
      // Get refresh token
      const refreshToken = await db.OauthRefreshToken.findOne({
        where: { token: req.body.refreshToken },
      });
      if (!refreshToken) {
        return res.status(401).json({ message: "Access denied" });
      }

      // check if the current expired date of refresh token is stil valid
      const currentDate = new Date();
      if (currentDate < refreshToken.expired_at) {
        const currentAccessToken = await refreshToken.getOauthAccessToken();
        const newAccessToken = Authentication.generateToken({
          sub: currentAccessToken.user_id,
        });

        // Update if valid
        await currentAccessToken.update({ token: newAccessToken });

        return res.status(200).json({
          token: newAccessToken,
          refreshToken: refreshToken.token,
          user: currentAccessToken.user_id,
        });
      } else {
        return res.status(401).json({ message: "Session expired" });
      }
    } catch (error) {
      return res.status(500).json({ message: "Error", data: error });
    }
  }

  // Activate user email
  async activate(req: express.Request, res: express.Response) {
    try {
      const token = req.params.token;
      const existingUser = await db.User.findOne({
        where: { email_token: token },
        attributes: ["id"],
      });
      if (!existingUser) {
        return res.status(400).json({ message: "Activation link not valid!" });
      }

      existingUser.email_token = null;
      existingUser.email_verified_at = Date.now();
      await existingUser.save();

      return res.status(200).json({ message: "Email activated" });
    } catch (error) {
      return res.status(404).json("Data not found");
    }
  }

  async forgot(req: express.Request, res: express.Response) {
    try {
      const email = req.body.email;

      const existingUser = await db.User.findOne({
        where: { email: email },
        attributes: ["id", "email"],
      });
      if (!existingUser) {
        return res.status(400).json({ message: "Account does not exists" });
      }

      // Generate a random string
      const resetToken = randomString();

      const mailData = {
        from: '"Aplikasi 1" <noreply@aplikasi1.com>',
        to: email,
        subject: "Reset password",
        text: "Please click the following link to reset your account: http://localhost:8080/-password",
        html: `<p>Please click the following link to reset your account: <a href="http://localhost:8080/reset-password/${resetToken}">Reset Password</a></p>`,
      };
      // // Send activation email
      await sendActivationEmail(mailData);

      existingUser.email_token = resetToken;
      await existingUser.save();

      return res.status(200).json({ message: "Email reset password sent" });
    } catch (error) {
      return res.status(404).json("Data not found");
    }
  }

  async resetInit(req: express.Request, res: express.Response) {
    try {
      const token = req.params.token;

      const existingUser = await db.User.findOne({
        where: { email_token: token },
        attributes: ["id", "email"],
      });
      if (!existingUser) {
        return res.status(400).json({ message: "Account does not exists" });
      }

      return res.status(200).json({
        message: "Found",
        data: {
          email: existingUser.email,
          token: token,
        },
      });
    } catch (error) {
      return res.status(404).json("Data not found");
    }
  }

  async resetAccount(req: express.Request, res: express.Response) {
    try {
      const { password, token, email } = req.body;

      const existingUser = await db.User.findOne({
        where: { email_token: token, email: email },
        attributes: ["id", "email"],
      });
      if (!existingUser) {
        return res
          .status(400)
          .json({ message: "Account/Reset password does not exists" });
      }

      // If account exists - proceed reset account
      const newHashedPassword = await bcrypt.hash(password, 10);
      existingUser.password = newHashedPassword;
      existingUser.email_token = null;
      await existingUser.save();

      return res.status(200).json({
        message: "new Password saved",
        data: true,
      });
    } catch (error) {
      console.log(error);
      return res.status(404).json({ message: "error", data: error });
    }
  }

  // Revoke the token stored in database
  // It will give more faster performance if the token stored in in memoty db liek Redis
  async logout(req: express.Request, res: express.Response) {
    try {
      const user = await db.User.findOne({
        where: { id: res.app.locals.credential.sub },
        attributes: ["id", "name", "email"],
      });

      const accessToken = await db.OauthAccessToken.findOne({
        where: { user_id: user.id },
        attributes: ["id", "token"],
      });

      const refreshToken = await db.OauthRefreshToken.findOne({
        where: { oauth_access_token_id: accessToken.id },
      });

      // Delete all token related current token
      refreshToken.destroy();
      accessToken.destroy();

      return res.status(200).json({ message: "logged out" });
    } catch (error) {
      return res.status(401).json({ message: "Access denied" });
    }
  }

  // Generate user "me" data
  async me(req: express.Request, res: express.Response) {
    try {
      const user = await db.User.findOne({
        where: { id: res.app.locals.credential.sub },
        attributes: ["id", "name", "email"],
      });

      return res.status(200).json({ message: "success", data: user });
    } catch (error) {
      return res.status(401).json({ message: "Access denied" });
    }
  }
}

export default new AuthController();
