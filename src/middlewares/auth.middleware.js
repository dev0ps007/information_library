import jwt from 'jsonwebtoken';
import administratorsService from '../services/administrators.service.js';

async function authMiddleware(req, res, next) {
  const cookies = req.cookies;
  if (cookies && cookies.Authentication) {
    const secret = process.env.JWT_TOKEN_SECRET;
    try {
      const decoded = jwt.verify(cookies.Authentication, secret);
      const user = await administratorsService.findAdministratorById(decoded.userId);
      if (user.rows[0]) {
        req.administrator = user.rows[0];
        next();
      } else {
        // res.status(401).json('Unauthorized');
        res.redirect('/');
      }
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  } else {
    // res.status(401).json('Unauthorized');
    res.redirect('/');
  }
}

export default authMiddleware;
