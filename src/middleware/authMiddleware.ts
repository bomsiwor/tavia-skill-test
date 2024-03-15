import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
const db = require("../db/model/model.js");

export const auth = (req: Request, res: Response, next: NextFunction): any => {
  if (!req.headers.authorization) {
    return res.status(401).json("not authenticated");
  }

  let secretKey = process.env.JWT_SECRET_KEY || "secret";

  const token: string = req.headers.authorization?.split(" ")[1];

  try {
    // Check if token is still exists
    // User have not logged out
    const checkToken = async () =>
      await db.OauthAccessToken.findOne({
        where: { token: token },
      });
    if (!checkToken) {
      return res.status(401).json({ message: "Session expired" });
    }

    const credential: string | object = jwt.verify(token, secretKey);

    if (credential) {
      req.app.locals.credential = credential;
      req.app.locals.token = token;
      next();
    } else {
      return res.send("Token invalid!");
    }
  } catch (err) {
    return res.send(err);
  }
};
