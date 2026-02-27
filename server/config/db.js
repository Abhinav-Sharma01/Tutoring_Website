import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        if (!process.env.MONGO_URI || !process.env.DB_NAME) {
            throw new Error("Missing MongoDB Environment Variables");
        }

        const uri = `${process.env.MONGO_URI}/${process.env.DB_NAME}?appName=Cluster0`;
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
            console.log("MongoDB Connected:", mongoose.connection.host);
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        cached.promise = null;
        console.error("Error connecting to DB:", error.message);
        throw error;
    }
}



