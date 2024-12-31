import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {
  getUnauthorizedErrorResponse,
  getNotFoundErrorResponse,
} from "../utils/responseUtils.js";
import {
  ERROR_INVALID_TOKEN,
  ERROR_USER_NOT_FOUND,
  ERROR_UNAUTHORIZED
} from "../constants/messages.js";

// Middleware to authenticate a token without verifying the user
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json(getUnauthorizedErrorResponse(ERROR_INVALID_TOKEN));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res
        .status(403)
        .json(getUnauthorizedErrorResponse(ERROR_INVALID_TOKEN));
    }
    req.user = user;
    next();
  });
};

// Middleware to authenticate a token and verify the user
export const authenticateUser = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  
  if (!authHeader) {
    return res
      .status(401)
      .json(getUnauthorizedErrorResponse(ERROR_INVALID_TOKEN));
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select(
      "profileName email profilePhoto phone role"
    );

    if (!user) {
      return res
        .status(401)
        .json(getNotFoundErrorResponse(ERROR_USER_NOT_FOUND));
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json(getUnauthorizedErrorResponse(ERROR_INVALID_TOKEN));
  }
};

// Middleware to check user roles
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json(getUnauthorizedErrorResponse(ERROR_UNAUTHORIZED));
    }
    next();
  };
};

export default { authenticateToken, authenticateUser, authorizeRoles };
