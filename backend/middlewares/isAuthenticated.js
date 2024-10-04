import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                message: 'User not Authenticated',
                success: false
            });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        if (!decoded) {
            return res.status(401).json({
                message: 'Invalid User',
                success: false
            });
        }

        // Store the user ID in the request object for further use
        req.id = decoded.userId; // Make sure this matches your token structure
        next(); // Call the next middleware or route handler
    } catch (error) {
        console.error('Authentication Error:', error); // Log the error for debugging
        return res.status(500).json({
            message: 'Internal Server Error',
            success: false
        });
    }
}

export default isAuthenticated;
