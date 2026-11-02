const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'restaurant-management-secret-key-2026';

/**
 * Hash a plain text password using scrypt with a random salt.
 * Returns formatted string: `${salt}:${derivedKey}`
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

/**
 * Compare a plain text password against a stored hashed password.
 */
function comparePassword(password, storedCombined) {
  if (!storedCombined || typeof storedCombined !== 'string') return false;
  const parts = storedCombined.split(':');
  if (parts.length !== 2) return false;
  const [salt, storedHash] = parts;
  const candidateHash = crypto.scryptSync(password, salt, 64).toString('hex');
  const storedBuf = Buffer.from(storedHash, 'hex');
  const candidateBuf = Buffer.from(candidateHash, 'hex');
  if (storedBuf.length !== candidateBuf.length) return false;
  return crypto.timingSafeEqual(storedBuf, candidateBuf);
}

/**
 * Create a signed JWT token (HMAC-SHA256, HS256).
 * Payload expires in 7 days by default.
 */
function createToken(payload, expiresInSeconds = 7 * 24 * 60 * 60) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

/**
 * Verify a signed JWT token.
 * Returns payload object if valid, or null if invalid/expired.
 */
function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;

  const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

module.exports = {
  hashPassword,
  comparePassword,
  createToken,
  verifyToken,
};

