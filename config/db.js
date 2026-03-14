import mongoose from "mongoose";

const connectDB = async()=>{
    try {
        // await mongoose.connect("mongodb+srv://sagar_db_user:PhqsoqJjghui8dol@cluster0.plk8zao.mongodb.net/khushi_car_motor");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("mongoDB connected successfully")
    } catch (error) {
        console.log("mongodb error", error.message)
    }
    
}

export default connectDB;