const crypto = require("crypto");
const dotenv = require("dotenv");
dotenv.config();

// Get encryption key from environment variable
// IMPORTANT: In production, use a strong, unique 32-byte key stored securely in environment variables
// Generate a key: require('crypto').randomBytes(32).toString('hex')
const getEncryptionKey = () => {
  if (process.env.ENCRYPTION_KEY) {
    // If ENCRYPTION_KEY is provided as hex string, convert it
    if (process.env.ENCRYPTION_KEY.length === Number(process.env.ENCRYPTION_KEY_LENGTH)) {
      return Buffer.from(process.env.ENCRYPTION_KEY, "hex");
    }
    // Otherwise, derive a key from the string
    return crypto.scryptSync(process.env.ENCRYPTION_KEY, "salt", Number(process.env.SALT));
  }
  // Fallback: derive key from a default (NOT RECOMMENDED FOR PRODUCTION)
  console.warn("WARNING: Using default encryption key. Set ENCRYPTION_KEY in environment variables!");
  return crypto.scryptSync("default-key-change-in-production", "salt", Number(process.env.SALT));
};

const ENCRYPTION_KEY = getEncryptionKey();
const ALGORITHM = "aes-256-cbc";

/**
 * Encrypts a password using AES-256-CBC encryption
 * @param {string} text - The password to encrypt
 * @returns {string} - The encrypted password (format: iv:encryptedData)
 */
function encrypt(text) {
  if (!text) return text;
  
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt password");
  }
}

/**
 * Decrypts a password that was encrypted using encrypt()
 * @param {string} encryptedText - The encrypted password (format: iv:encryptedData)
 * @returns {string} - The decrypted password
 */
function decrypt(encryptedText) {
  if (!encryptedText) return encryptedText;
  
  try {
    // Check if the text is in the encrypted format (contains :)
    if (!encryptedText.includes(":")) {
      // If not encrypted format, might be old bcrypt hash or plain text
      // Return as is or throw error based on your needs
      return encryptedText;
    }
    
    const parts = encryptedText.split(":");
    const iv = Buffer.from(parts[0], "hex");
    const encryptedData = parts[1];
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    // If decryption fails, return empty string or handle error
    throw new Error("Failed to decrypt password");
  }
}

module.exports = {
  encrypt,
  decrypt,
};
