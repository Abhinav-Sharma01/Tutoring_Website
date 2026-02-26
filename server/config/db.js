import mongoose from "mongoose";

const cached = { conn: null, promise: null };

export const connectDB = async () => {
    if (cached.conn) {
        console.log("🔥 Using cached MongoDB connection");
        return cached.conn;
    }

    if (!cached.promise) {
        console.log("🔥 connectDB() is running...");
        const uri = `${process.env.MONGO_URI}/${process.env.DB_NAME}?appName=Cluster0`
        cached.promise = mongoose.connect(uri).then((mongoose) => {
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



