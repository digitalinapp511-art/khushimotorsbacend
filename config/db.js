import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("mongoDB connected successfully")
        console.log("mongoDB connected database name:", mongoose.connection.name);
    } catch (error) {
        console.log("mongodb error", error.message)
    }
}

export default connectDB;