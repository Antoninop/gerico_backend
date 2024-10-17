const jwt = require('jsonwebtoken');

exports.authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'Token manquant ou invalide' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expiré. Veuillez vous reconnecter.' });
      } else {
        return res.status(403).json({ message: 'Token invalide.' });
      }
    }

    req.user = user; 
    next();
  });
};
