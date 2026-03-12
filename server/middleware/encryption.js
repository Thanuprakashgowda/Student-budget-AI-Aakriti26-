const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const ENCRYPTION_KEY_RAW = process.env.ENCRYPTION_KEY || 'studentbudgetai_default_secret_pad_2026';
const key = crypto.createHash('sha256').update(ENCRYPTION_KEY_RAW).digest();

const encryptField = (text) => {
  if (typeof text !== 'string') text = String(text);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
};

const decryptField = (text) => {
  try {
    if (!text || !text.includes(':')) return text;
    const [ivHex, encryptedHex] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText);
    return Buffer.concat([decrypted, decipher.final()]).toString('utf8');
  } catch (err) { 
    return text; 
  }
};

module.exports = { encryptField, decryptField };
