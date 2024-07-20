const jwt = require('jsonwebtoken');

const cookieJwtAuth = (req, res, next) => {
  const token = req.cookies.token;
  console.log('cookieJwtAuth: token: ', token);
  if (!token) return res.status(401).send('Access Denied');

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    res.clearCookie('token');
    res.status(400).send('Invalid Token');
    return redirect('/login');
  }
};

module.exports = cookieJwtAuth;

