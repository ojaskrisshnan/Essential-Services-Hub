import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_12345');
      
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ message: 'User not found. Authorization failed.' });
      }

      if (user.isBlocked) {
        return res.status(403).json({ message: 'User account is blocked. Please contact support.' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Token validation error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed.' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token provided.' });
  }
};
