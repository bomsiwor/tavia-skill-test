import express, { Request, Response } from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import bcrypt, { hash } from "bcrypt";
import Authentication from "../util/authentication";
import BaseController from "./baseController";
import { generateResponse, generateTimeAfter, randomString } from "../util";
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
        return generateResponse(res, 404, "User not found!", null);
      }

      //  Check password
      let checkPassword = await Authentication.passwordCheck(
        reqData.password,
        user.password
      );
      if (!checkPassword) {
        return generateResponse(res, 401, "Credential not valid!", null);
      }

      // Check max number of device
      // Throw error if device exceeded
      const countDevice = await db.OauthAccessToken.count({
        where: { user_id: user.id },
      });
      if (countDevice > 3) {
        return generateResponse(res, 401, "Max device exceeded!", null);
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

      return generateResponse(res, 200, "Success", {
        token: token,
        refreshToken: refreshToken,
        user: user.id,
      });
    } catch (error) {
      console.log(error);
      return generateResponse(res, 500, "Error!", null);
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
        return generateResponse(res, 400, "Email already exists", null);
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
      return generateResponse(
        res,
        200,
        "User registered successfully. Activation email sent.",
        null
      );
    } catch (error) {
      return generateResponse(res, 500, "Error register", null);
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
        return generateResponse(res, 401, "Access denied", null);
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

        return generateResponse(res, 200, "Success refresh", {
          token: newAccessToken,
          refreshToken: refreshToken.token,
          user: currentAccessToken.user_id,
        });
      } else {
        return generateResponse(res, 401, "Access denied", null);
      }
    } catch (error) {
      return generateResponse(res, 500, "Error Internal", null);
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
        return generateResponse(res, 400, "Activation link not valid!", null);
      }

      existingUser.email_token = null;
      existingUser.email_verified_at = Date.now();
      await existingUser.save();

      return generateResponse(res, 200, "Email activated!", true);
    } catch (error) {
      return generateResponse(res, 400, "Data not found!", true);
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
        return generateResponse(res, 404, "Account not exists", null);
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

      return generateResponse(res, 200, "Email reset password sent", null);
    } catch (error) {
      return generateResponse(res, 404, "Data not found!", null);
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
        return generateResponse(res, 404, "Account not exists", null);
      }

      return generateResponse(res, 200, "Email reset password discovered", {
        email: existingUser.email,
        token: token,
      });
    } catch (error) {
      return generateResponse(res, 404, "Data not found!", null);
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
        return generateResponse(res, 404, "Account not exists", null);
      }

      // If account exists - proceed reset account
      const newHashedPassword = await bcrypt.hash(password, 10);
      existingUser.password = newHashedPassword;
      existingUser.email_token = null;
      await existingUser.save();

      return generateResponse(res, 200, "new Password saved", true);
    } catch (error) {
      return generateResponse(res, 404, "Error", null);
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

      return generateResponse(res, 200, "Logged out", true);
    } catch (error) {
      return generateResponse(res, 500, "Error logout", true);
    }
  }

  // Generate user "me" data
  async me(req: express.Request, res: express.Response) {
    try {
      const user = await db.User.findOne({
        where: { id: res.app.locals.credential.sub },
        attributes: ["id", "name", "email"],
      });

      return generateResponse(res, 200, "Success", user);
    } catch (error) {
      return generateResponse(res, 200, "Access denied", null);
    }
  }
}

export default new AuthController();
