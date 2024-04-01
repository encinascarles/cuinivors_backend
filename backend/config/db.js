import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

const connectDB = async () => {
  console.log("Connecting to MongoDB");
  let mongoUri;

  if (process.env.NODE_ENV === "test") {
    console.log("Using in-memory database");
    const mongoServer = await MongoMemoryServer.create({
      instance: {
        startupTimeout: 10000,
      },
    });
    mongoUri = await mongoServer.getUri();
  } else {
    mongoUri = process.env.MONGO_URI;
  }
  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
