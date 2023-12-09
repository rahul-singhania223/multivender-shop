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

    return {
      public_id: uploadInstance.public_id as string,
      url: uploadInstance.secure_url as string,
    };
  } catch (err) {
    fs.unlinkSync(localFilePath);
  }
};

const deleteImageFromCloudinary = async (
  public_id: string
): Promise<string> => {
  try {
    const response = await cloudinary.uploader.destroy(public_id, {
      resource_type: "image",
    });

    return response.result;
  } catch (err) {
    return "failed";
  }
};

export { uploadOnCloudinary, deleteImageFromCloudinary };
