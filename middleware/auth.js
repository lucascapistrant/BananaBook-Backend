import jwt from 'jsonwebtoken';

function verifyToken(req, res, next) {
    const authHeader = req.header('Authorization')
    
    if(!authHeader) {
        return res.status(401).json({message: "Access denied, no token provided"})
    }
    
    const token = authHeader.split(' ')[1];

    if(!token) {
        return res.status(401).json({ message: 'Access denied, malformed token' });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodedToken;
        next();
    } catch(err) {
        console.error('JWT Verification Error:', err.message);
        res.status(401).json({ message: 'Invalid token' });
    }
};

export default verifyToken;