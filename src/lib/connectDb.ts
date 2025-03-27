import mongoose from "mongoose";
type connectionObject = {
  isConnected?: number;
};
const connection: connectionObject = {};
export default async function dbConnect() {
  if (connection.isConnected) {
    console.log("Already connected to the database");
    return;
  }
  try {
    const db = await mongoose.connect(process.env.MONGO_URI as string);
    connection.isConnected = db.connections[0].readyState;
    console.log("Connected to the database");
  } catch (error: any) {
    console.error("Error connecting to the database", error.message);
    process.exit(1);
  }
}
