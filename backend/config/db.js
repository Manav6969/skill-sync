import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config(); 

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};
