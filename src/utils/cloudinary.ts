import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_SECRET as string,
});

const uploadOnCloudinary = async (localFilePath: string) => {
  try {
    const uploadInstance = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    fs.unlinkSync(localFilePath);

    console.log(uploadInstance);
  } catch (err) {
    console.log(err);
    fs.unlinkSync(localFilePath);
  }
};

export { uploadOnCloudinary };
