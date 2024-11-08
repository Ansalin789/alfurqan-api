import bcrypt from 'bcrypt';
import config from '../config/env';
import CryptoJS from 'crypto-js';
import jwt from 'jsonwebtoken';
import { isNil } from 'lodash';

interface RedisData {
  jobProfilingId: string;
  jobDescription: string;
  jobAdditionalDetails: any;
  link: any;
  model: any;
  tenantId: string;
}

const secretKey = config.encryption.iv;

// Hash password function
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

// Verify Hashed password
export const verifyPassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

// Function to decode the custom encoded string back to Base64
export const decodeCustomBase64 = (value: string): string => {
  let base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return base64;
};

export const encryptPassword = (plainText: string): string => {
  // Encrypt the plain text password using the secret key
  const encryptedBytes = CryptoJS.AES.encrypt(plainText, secretKey);
  const encrypted = encryptedBytes.toString(); // Encrypted data as Base64 string
  // Convert to custom Base64 format
  const customBase64 = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encrypted))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return customBase64;
};


// Custom validation function to check if the password is encrypted
export const isEncryptedPassword = (value: string): boolean => {
  const base64 = decodeCustomBase64(value);

  if (!CryptoJS.enc.Base64.parse(base64)) {
    return false;
  }

  const encrypted = CryptoJS.enc.Base64.parse(base64).toString(CryptoJS.enc.Utf8);

  const decryptedBytes = CryptoJS.AES.decrypt(encrypted, secretKey);
  const decryptedPassword = decryptedBytes.toString(CryptoJS.enc.Utf8);

  return decryptedPassword !== '';
};

// Decrypt function
export const decryptPassword = (encryptedValue: string): string => {
  // Decode the custom Base64 string
  const base64 = decodeCustomBase64(encryptedValue);

  // Parse the Base64 string to get the encrypted data
  const encrypted = CryptoJS.enc.Base64.parse(base64).toString(CryptoJS.enc.Utf8);

  // Decrypt the encrypted data using the secret key
  const decryptedBytes = CryptoJS.AES.decrypt(encrypted, secretKey);
  const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
  return decryptedText;
};


// Generate JWT token
export const generateAuthToken = (data: any): string => jwt.sign(data, config.jwtAuth.secret, { expiresIn: config.jwtAuth.expiresIn, algorithm: 'HS256' });

export const authUserData = (token: string) => {
  let userInfo = {
    userName: "NO-AUTH",
    userId: "Unknown",
    tenantId: "Unknown"
  };
  const decodedToken: any = jwt.decode(token.replace("Bearer", ""));
  if (decodedToken) {
    const { userName, sub, tenantId } = decodedToken;
    userInfo = {
      userName: userName ?? "NO-AUTH",
      userId: sub ?? "Unknown",
      tenantId: tenantId ?? "Unknown"
    };
  }
  return userInfo;
}

// Helper function to format values
export const formatAuditChangedValues = (value: any): string => {
  // Helper function to format objects
  const formatObject = (obj: object): string => {
    return JSON.stringify(
      obj,
      (key, value) => ((key === "_id" || key === "type") ? undefined : value),
      2
    );
  };

  if (isNil(value)) {
    return "Null";
  }
  if (typeof value === "object") {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return formatObject(value); // Format objects, excluding _id
  }
  return String(value); // Convert all other values to string
};
export const convertHtmlTemplateToString = (value: string): string => value.replace(/<\/?([ou]l|li|b)[^>]*>/gi, '').replace(/<[^>]*>/g, '').replace(/•/g, '').replace(/\s+/g, ' ').trim();


export const generateRandom8Digit = (): number => Math.floor(10000000 + Math.random() * 90000000);
