const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        res.locals.isAuthenticated = false;
        next();
    } else {
        try {
            const decoded = jwt.verify(token, 'votreCleSecrete');
            res.locals.isAuthenticated = true;
            res.locals.currentUser = decoded.username;
            next();
        } catch (error) {
            res.locals.isAuthenticated = false;
            next();
        }
    }
};

module.exports = verifyToken;
