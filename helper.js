import * as crypto from 'node:crypto';
import settings from './appsettings.js';
import Base64 from './base_64.js';

const time = () => new Date().toTimeString().substring(0, 8);

function delay(timeout, isOk = true) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      isOk ? resolve() : reject();
    }, timeout);
  });
}

function getAllowedContentType(path) {
  let dotIndex = path.lastIndexOf('.');
  if (dotIndex === -1) return null;
  const ext = path.substring(dotIndex + 1);
  let contentType = null;
  switch (ext) {
    case 'html': contentType = "text/html; charset=utf-8"; break;
    case 'css': contentType = "text/css; charset=utf-8"; break;
    case 'js': contentType = "text/javascript; charset=utf-8"; break;
    case 'txt': contentType = "text/plain; charset=utf-8"; break;
    case 'png': contentType = "image/png"; break;
    case 'jpg': contentType = "image/jpeg"; break;
    case 'jpeg': contentType = "image/jpeg"; break;
    case 'gif': contentType = "image/gif"; break;
    case 'ico': contentType = "image/x-icon"; break;
    default: contentType = null;
  }
  return contentType;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateToken(username, password) {
  const payload = `${username}:${password}:${Date.now()}`;
  const token = crypto.createHmac('sha256', settings.secretKey).update(payload).digest('hex');
  return Base64.encode(`${username}:${token}`);
}

function validateToken(token) {
  if (!token || typeof token !== 'string') return false;
  try {
    const decoded = Base64.decode(token);
    const [username, hash] = decoded.split(':');
    if (!username || !hash) return false;
    return /^[a-f0-9]{64}$/.test(hash);
  } catch {
    return false;
  }
}

function parseAuthorizationHeader(header) {
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.substring(7);
}

export {
  time,
  delay,
  getAllowedContentType,
  getRandomInt,
  generateToken,
  validateToken,
  parseAuthorizationHeader
};
