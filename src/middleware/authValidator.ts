import { Request, Response, NextFunction } from "express";
import { check, validationResult } from "express-validator";

export const validateLogin = [
  check("email").isEmail(),
  check("password").isLength({ min: 8 }),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).send({ errors: errors.array() });
    }

    next();
  },
];

export const validateRegister = [
  check("email").isEmail(),
  check("password").isLength({ min: 8 }),
  check("name").isString().isLength({ min: 3 }),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).send({ errors: errors.array() });
    }

    next();
  },
];

export const validateRefreshToken = [
  check("refreshToken").isString(),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).send({ errors: errors.array() });
    }

    next();
  },
];
