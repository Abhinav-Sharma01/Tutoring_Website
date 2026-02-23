import "dotenv/config";
import mongoose from "mongoose";

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        console.log("=== ALL USERS IN DB ===");
        users.forEach(u => console.log(`${u.email} - Role: ${u.role}`));
        mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkUsers();
