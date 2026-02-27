import app from "../server.js";

// Vercel Serverless Function configuration to bypass the 4.5MB body limit
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '100mb', // High limit for video uploads
        },
    },
};

export default app;
