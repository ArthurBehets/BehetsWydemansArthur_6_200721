const jwt = require('jsonwebtoken');
// Token verification
module.exports = (req, res, next) => {
  try {
    if(jwtDecode(token).exp < Date.now() / 1000){ // token validation time check
      const token = req.headers.authorization.split(' ')[1];
      const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET'); //token verification
      const userId = decodedToken.userId; //userID check
      if (req.body.userId && req.body.userId !== userId) {
        throw 'Invalid user ID';
      } else {
      next();
      }
    }
  } 
  catch {
      res.status(401).json({
      error: new Error('Invalid request!')
    });
  }
};