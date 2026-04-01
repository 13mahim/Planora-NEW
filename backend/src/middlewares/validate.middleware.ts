import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const handleValidation = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array().map(e => ({ field: (e as any).path, message: e.msg })),
    });
  }
  next();
};

export const validateRegister = [
  body("email").isEmail().withMessage("Invalid email address"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("displayName").trim().notEmpty().withMessage("Name is required").isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
  handleValidation,
];

export const validateLogin = [
  body("email").isEmail().withMessage("Invalid email address"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidation,
];

export const validateEvent = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("date").notEmpty().withMessage("Date is required"),
  body("time").notEmpty().withMessage("Time is required"),
  body("venue").trim().notEmpty().withMessage("Venue is required"),
  body("registrationFee")
    .if(body("isFree").equals("false"))
    .isFloat({ min: 0.01 })
    .withMessage("Registration fee must be greater than 0 for paid events"),
  handleValidation,
];

export const validateReview = [
  body("eventId").notEmpty().withMessage("Event ID is required"),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("comment").trim().notEmpty().withMessage("Comment is required"),
  handleValidation,
];

export const validateInvitation = [
  body("eventId").notEmpty().withMessage("Event ID is required"),
  body("inviteeEmail").isEmail().withMessage("Valid invitee email is required"),
  handleValidation,
];
