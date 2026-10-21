import mongoose from "mongoose";

export async function connectDB() {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI || mongoURI === "PASTE_YOUR_MONGODB_ATLAS_URI_HERE") {
    throw new Error("MONGO_URI is missing. Configure Backend/.env first.");
  }

  await mongoose.connect(mongoURI);

  console.log(`MongoDB connected: ${mongoose.connection.name}`);
}
