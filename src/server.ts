import dotenv from "dotenv";
import { app } from "./app";
import { connectDb } from "./db/connectDb";

dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 5000;

connectDb()
  .then(() => {
    app.on("error", (err) => {
      console.log("SERVER ERROR: ", err);
      throw err;
    });

    app.listen(port, () => {
      console.log(`SERVER IS LISTENING ON PORT ${port}`);
    });
  })
  .catch((err: any) => {
    console.log("MONGODB CONNECTION ERROR: ", err);
  });
