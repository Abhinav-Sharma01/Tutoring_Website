import jwt from "jsonwebtoken";

export const protect = async(req,res,next) => {
    try{
        const accessToken = req.cookies?.accessToken;

        if(accessToken){
            try{
                let decoded = jwt.verify(accessToken,JWT_ACCESS_TOKEN_SECRET);
                req.user = decoded;
                return next();
            }catch(error){}
        }

        const refreshToken = req.cookies?.refreshToken;
        if(!refreshToken){
            return res.status(401).json({message: "Not authorized..."});
        }

        let decoded;
        try{
            decoded = jwt.verify(refreshToken,JWT_REFRESH_TOKEN_SECRET);
        }catch(error){
            return res.status(401).json({ message: "Refresh token invalid or expired" });
        }

        const newaccessToken = jwt.sign(
            {id: decoded.id,role: decoded.role},
            JWT_ACCESS_TOKEN_SECRET,
            {expiresIn: "15m"}
        )

        req.user = decoded;

        res.cookie('accessToken',newaccessToken,{
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 15 * 60 * 1000
        })

        next();

    }catch(error){
        return res.status(401).json({message: "Unauthorized",error:error.message});
    }
}