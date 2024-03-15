import crypto from "crypto";
import express from "express";

export const randomString = () => {
  // Generate a random string
  const randomString = Math.random().toString(36).substring(2); // Generate a random string

  // Hash the random string using SHA256
  // This function generate random string for email activation
  const hash = crypto.createHash("sha256").update(randomString).digest("hex");

  return hash;
};

export const generateTimeAfter = (maxTime: number) => {
  // Get current date
  const currentDate = new Date();

  // Add 3 days to the current date
  const afterTime = new Date(currentDate.getTime() + maxTime * 60 * 1000);

  // Convert the date to a timestamp
  const timestamp = afterTime.getTime();

  return timestamp;
};

export const generateResponse = (
  res: express.Response,
  code: number,
  message: string,
  data: any
) => {
  return res.status(code).json({
    code: code,
    message: message,
    data: data,
  });
};
