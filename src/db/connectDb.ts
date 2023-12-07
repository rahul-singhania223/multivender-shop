import mongoose from "mongoose";
import { DB_NAME } from "../constants";

const connectDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}`
    );

    console.log(
      `DATABASE CONNECTED SUCCESSFULLY !! DB HOST: `,
      connectionInstance.connection.host
    );
  } catch (err: any) {
    console.log(`MONGODB CONNECTION FAILED: \n `, err);
    process.exit(1);
  }
};

export { connectDb };
