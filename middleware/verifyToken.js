const jwt = require('jsonwebtoken');

function getBearerToken(req) {
  return req.headers.authorization?.split(' ')[1];
}

const verifyToken = (req, res, next) => {
  const token = getBearerToken(req);

  if (!token) {
    return res.status(403).json({ error: 'No token provided' });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = verifyToken;