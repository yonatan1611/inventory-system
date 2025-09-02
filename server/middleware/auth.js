import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      // Provide more specific error messages
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({ 
          success: false,
          message: 'Token expired' 
        });
      } else if (err.name === 'JsonWebTokenError') {
        return res.status(403).json({ 
          success: false,
          message: 'Invalid token' 
        });
      } else {
        return res.status(403).json({ 
          success: false,
          message: 'Token verification failed' 
        });
      }
    }
    
    req.user = user;
    next();
  });
};