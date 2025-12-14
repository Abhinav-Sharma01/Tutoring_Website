import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        console.log("🔥 connectDB() is running...");
        const uri = `${process.env.MONGO_URI}/${process.env.DB_NAME}?appName=Cluster0`
        const connect = await mongoose.connect(uri);
        console.log("MongoDB Connected:", connect.connection.host);
    }catch(error) {
        console.error("Error connecting to DB:", error.message);
        process.exit(1);
    }
}



