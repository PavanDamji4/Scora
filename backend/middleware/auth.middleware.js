const { auth } = require('../config/firebase-admin');

// Verifies the Firebase ID token sent from the frontend in the
// Authorization header: "Bearer <token>"
async function verifyAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No auth token provided' });
  }

  const idToken = authHeader.split(' ')[1];

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    req.user = decodedToken; // contains uid, email, etc.
    next();
  } catch (error) {
    console.error('Auth verification failed:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = verifyAuth;