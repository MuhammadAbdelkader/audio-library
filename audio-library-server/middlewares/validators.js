const { body, param, query, validationResult } = require("express-validator");
const mongoose = require("mongoose");

// Helper to run validations and catch errors globally
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 400;
    error.errors = errors.array();
    return next(error);
  }
  next();
};

// Custom: Password must include number or symbol
const passwordComplexity = body("password")
  .isLength({ min: 6 })
  .withMessage("Password must be at least 6 characters")
  .matches(/[\d!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|~-]/)
  .withMessage("Password must include a number or special character");

// Custom: Genre must be from a predefined list
const allowedGenres = ["education", "religion", "comedy", "fiction", "self-help"];
const genreValidator = body("genre")
  .notEmpty()
  .withMessage("Genre is required")
  .custom((value) => allowedGenres.includes(value))
  .withMessage("Invalid genre");

// Custom: Check MongoDB ObjectId
const objectIdValidator = param("id")
  .custom((value) => mongoose.Types.ObjectId.isValid(value))
  .withMessage("Invalid ID");

// Reusable arrays for different routes:
const registerValidators = [
  body("name").notEmpty().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
  body("email").isEmail().withMessage("Invalid email"),
  passwordComplexity,
  body("role").optional().isIn(["user", "admin"]).withMessage("Role must be user or admin"),
];

const loginValidators = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password").notEmpty().withMessage("Password required"),
];

const updateProfileValidators = [
  body("name").optional().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
];

const audioUploadValidators = [
  body("title").notEmpty().isLength({ min: 3 }).withMessage("Title must be at least 3 characters"),
  genreValidator,
  body("isPrivate").optional().isBoolean().withMessage("isPrivate must be boolean"),
];

const audioUpdateValidators = [
  body("title").optional().isLength({ min: 3 }).withMessage("Title must be at least 3 characters"),
  body("genre").optional().custom((value) => allowedGenres.includes(value)).withMessage("Invalid genre"),
  body("isPrivate").optional().isBoolean().withMessage("isPrivate must be boolean"),
];

const commentValidators = [
  body("text").notEmpty().isLength({ max: 500 }).withMessage("Comment must not exceed 500 characters"),
];

const searchValidators = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  query("genre").optional().isIn(allowedGenres).withMessage("Invalid genre filter"),
];

module.exports = {
  validate,
  registerValidators,
  loginValidators,
  updateProfileValidators,
  genreValidator,
  objectIdValidator,
  audioUploadValidators,
  audioUpdateValidators,
  commentValidators,
  searchValidators,
};