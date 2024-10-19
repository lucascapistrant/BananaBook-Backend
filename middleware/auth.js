import jwt from 'jsonwebtoken';

function verifyToken(req, res, next) {
    const token = req.header('Authorization').split(' ')[1];
    if(!token) {
        res.status(401).json({ message: 'Access denied' });
    }
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodedToken;
        next();
    } catch {
        res.status(401).json({ message: 'Invalid token' });
    }
};

export default verifyToken;