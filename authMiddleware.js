const admin = require('./firebaseAdmin');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  
  if (!idToken) {
    return res.status(401).json({ error: 'Invalid token format' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken, true);
    req.user_id = decodedToken.uid;
    req.decodedToken = decodedToken; // Store the full decoded token for potential use
    next();
  } catch (error) {
    console.error('Token verification error:', error.code, error.message);
    
    // Handle specific Firebase Auth errors
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    } else if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({ error: 'Token revoked', code: 'TOKEN_REVOKED' });
    }
    
    return res.status(401).json({ error: 'Invalid token', code: 'INVALID_TOKEN' });
  }
};

module.exports = verifyToken;
