import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`);
        // mongoose return a object 
        console.log(`\n MongoDB connected !! DB HOST : ${connectionInstance.connection.host}`);

    } catch (error) {
        console.log(`MONOGODB connection Failed !! `, error);
        process.exit(1);
    }
}


export default connectDB