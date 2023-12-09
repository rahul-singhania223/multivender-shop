import { Request, Response, NextFunction } from "express";
import mongoose, { Types } from "mongoose";
import { IImage, IProduct, Product } from "../models/product.model";
import ApiError from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import {
  deleteImageFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary";

interface IUploaded {
  [fieldName: string]: Express.Multer.File[];
}

// CREATE NEW PRODUCT
const createProduct = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      title,
      description,
      discount,
      color,
      category,
      sub_category,
      owner,
    } = req.body as IProduct;

    const files: IUploaded = req.files as IUploaded;

    if (!title || title.length < 5) {
      return next(new ApiError("Title must be atleast 5 characters long", 400));
    }

    if (!description || description.length < 10) {
      return next(
        new ApiError("Description must be atleast 10 characters long", 400)
      );
    }

    if (!color) {
      return next(new ApiError("Colour is required", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(category as unknown as string)) {
      return next(new ApiError("Please select a product category", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(sub_category as unknown as string)) {
      return next(new ApiError("Please select a product category", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(owner as unknown as string)) {
      return next(new ApiError("Invalid owner id", 400));
    }

    if (!files["dp"]) {
      return next(new ApiError("Please add an image for product dp", 400));
    }

    if (!files["images"]) {
      return next(
        new ApiError("Please add atleast 2 images for product galary", 400)
      );
    }

    const productDocument: IProduct = {
      title,
      description,
      discount,
      color,
      category,
      sub_category,
      owner,
      dp: { public_id: "", url: "" },
      images: [],
    };

    const dpFilePath = files["dp"].map(
      (file: Express.Multer.File) => file.path
    )[0];

    const imagesFilePaths = files["images"].map(
      (file: Express.Multer.File) => file.path
    );

    const dp: IImage = (await uploadOnCloudinary(dpFilePath)) as IImage;
    const images: IImage[] = await Promise.all(
      imagesFilePaths.map(async (path): Promise<IImage> => {
        const uploadInfo = (await uploadOnCloudinary(path)) as IImage;
        return uploadInfo;
      })
    );

    productDocument.dp = dp as IImage;
    productDocument.images = images as IImage[];

    const newProduct = await Product.create(productDocument);

    if (!newProduct) {
      return next(new ApiError("Couldn't create new product", 500));
    }

    res
      .status(201)
      .json(new ApiResponse(true, 201, "Created a new product", newProduct));
  }
);

// DELETE PRODUCT
const deleteProduct = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const productId = req.params.id;
    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return next(new ApiError("Invalid product id", 400));
    }

    if (!user) {
      return next(new ApiError("Unauthorized error", 401));
    }

    const productToDelete = await Product.findById(productId);

    if (!productToDelete) {
      return next(new ApiError("Couldn't find product to delete", 500));
    }

    if (productToDelete.owner != user._id) {
      return next(new ApiError("Only owner can delete the product", 400));
    }

    const deleteDp = await deleteImageFromCloudinary(
      productToDelete.dp.public_id
    );

    let deleteImages = "ok";

    await Promise.all(
      productToDelete.images.map(async (image) => {
        const result = await deleteImageFromCloudinary(image.public_id);

        deleteImages = result;
      })
    );

    if (deleteDp !== "ok" || deleteImages !== "ok") {
      return next(new ApiError("Couldn't delete product images", 500));
    }

    const deleteInstance = await Product.deleteOne({ _id: productId });

    if (deleteInstance.deletedCount === 0) {
      return next(new ApiError("Product couldn't be deleted", 500));
    }

    const newProductList = await Product.find();

    if (!newProductList) {
      return next(new ApiError("Couldn't get products after deleting", 500));
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          true,
          200,
          "One product deleted successfully",
          newProductList
        )
      );
  }
);

// GET ALL PRODUCTS
const getAllProducts = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const products = await Product.find();

    if (!products) {
      return next(new ApiError("Couldn't find the products", 500));
    }

    res
      .status(200)
      .json(new ApiResponse(true, 200, "Got all products", products));
  }
);

// GET ONE PRODUCT
const getOneProruct = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const productId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return next(new ApiError("Invalid product id", 400));
    }

    const product = await Product.findById(productId);

    if (!product) {
      return next(new ApiError("Couldn't find the product", 500));
    }

    return res
      .status(200)
      .json(new ApiResponse(true, 200, "Got one product", product));
  }
);

// EDIT PRODUCT
const editProduct = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const productId = req.params.id;
    const changes = req.body;
    const files: IUploaded = req.files as IUploaded;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return next(new ApiError("Invalid product id", 400));
    }

    const fieldsToUpdate: any = {};

    for (let field in changes) {
      if (changes[field] !== "") {
        fieldsToUpdate[field] = changes[field];
      }
    }

    const product = await Product.findById(productId);

    if (!product) {
      return next(new ApiError("Couldn't find the product to update", 500));
    }

    if (files && files["dp"]) {
      const deleteDp = await deleteImageFromCloudinary(product.dp.public_id);

      if (deleteDp !== "ok") {
        return next(
          new ApiError("Couldn't delete dp of the product while updating", 500)
        );
      }

      const dpFilePath = files["dp"].map(
        (file: Express.Multer.File) => file.path
      )[0];

      const newDp = await uploadOnCloudinary(dpFilePath);

      if (!newDp) {
        return next(new ApiError("Couldn't update dp of the product", 500));
      }

      fieldsToUpdate.dp = newDp;
    }

    if (files && files["images"]) {
      let deleteImages = "failed";

      await Promise.all(
        product.images.map(async (image) => {
          const result = await deleteImageFromCloudinary(image.public_id);
          deleteImages = result;
        })
      );

      if (deleteImages !== "ok") {
        return next(
          new ApiError("Couldn't delete images while updating the product", 500)
        );
      }

      const newImagesPath: string[] = files["images"].map(
        (file: Express.Multer.File) => file.path
      );

      const newImagesUrls: IImage[] = await Promise.all(
        newImagesPath.map(async (path) => {
          const response = (await uploadOnCloudinary(path)) as IImage;

          return response;
        })
      );

      fieldsToUpdate.images = newImagesUrls;
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(true, 200, "Nothing to update", product));
    }

    const updateInstance = await Product.updateOne(
      { _id: productId },
      fieldsToUpdate
    );

    if (updateInstance.modifiedCount === 0) {
      return next(new ApiError("Couldn't update the product", 500));
    }

    const updatedProduct = await Product.findById(productId);

    res
      .status(200)
      .json(
        new ApiResponse(
          true,
          200,
          "One product updated successfully",
          updatedProduct
        )
      );
  }
);

export {
  createProduct,
  deleteProduct,
  getAllProducts,
  getOneProruct,
  editProduct,
};
