import "dotenv/config";
import mongoose from "mongoose";

const checkDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await mongoose.connection.db.collection('users').find({ role: 'admin' }).toArray();
        console.log('Admins in DB:', users.map(u => u.email));

        const u1 = await mongoose.connection.db.collection('users').findOne({ email: 'ab.qec123@gmail.com' });
        console.log('ab.qec123@gmail.com exists:', !!u1, 'Role:', u1?.role);

        const u2 = await mongoose.connection.db.collection('users').findOne({ email: 'qrcashwani@gmail.com' });
        console.log('qrcashwani@gmail.com exists:', !!u2, 'Role:', u2?.role);

        mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkDb();
