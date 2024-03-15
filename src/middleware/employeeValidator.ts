import { Request, Response, NextFunction } from "express";
import { check, validationResult } from "express-validator";

export const validateEmployee = [
  // First Name validation
  check("first_name").notEmpty().withMessage("First Name is required"),

  // Last Name validation (nullable)
  check("last_name").optional(),

  // Mobile Phone validation (nullable)
  check("mobile_phone").optional(),

  // Birthdate validation
  check("birthdate")
    .notEmpty()
    .withMessage("Birthdate is required")
    .isISO8601()
    .withMessage("Invalid date format"),

  // Blood Type validation
  check("blood_type").notEmpty().withMessage("Blood Type is required"),

  // Religion validation
  check("religion").notEmpty().withMessage("Religion is required"),

  // Email validation
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address"),

  // Place of Birth validation (nullable)
  check("place_of_birth").optional(),

  // Marital Status validation (nullable)
  check("marital_status").optional(),

  // Identity Type validation
  check("identity_type").notEmpty().withMessage("Identity Type is required"),

  // Identity Number validation (nullable)
  check("identity_number").optional(),

  // Permanent validation (nullable)
  check("permanent").optional().isBoolean(),

  // Citizen ID Address validation (nullable)
  check("citizen_id_address").optional(),

  // Residential Address validation (nullable)
  check("residential_address").optional(),

  // Identity Expiry Date validation (nullable)
  check("identity_expiry_date")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format"),

  // Postal Code validation (nullable)
  check("postal_code").optional(),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).send({ errors: errors.array() });
    }

    next();
  },
];
