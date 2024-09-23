// Description: Middleware to verify JWT token from cookie.
import jwt from 'jsonwebtoken';

const cookieJwtAuth = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    console.log('No token found');
    return res.status(401).json({ error: 'Access Denied: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    if (!req.user.isVerified) {
      return res.status(401).json({ error: 'Access Denied: Email not verified' });
    }
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    res.clearCookie('token');
    return res.status(401).json({ error: 'Access Denied: Invalid token' });
  }
};

export default cookieJwtAuth;
