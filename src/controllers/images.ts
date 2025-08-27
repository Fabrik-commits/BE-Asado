import { STATUS_CODES } from "../constants/httpStatusCode.js";
import { Image } from "../models/image.js";
import { extname } from "path";
import { isValidId } from "../utils/utils.js";
import { Request, Response } from "express";
import { IImage } from "../models/interfaces.js";
import mongoose from "mongoose";

export async function getImage(req: Request, res: Response): Promise<Response> {
  try {
    const id: string = req.params.id;
    if (!isValidId(id))
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ message: "No valid id was provided." });
    const image: IImage | null = await Image.findById(id);
    if (!image)
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ message: "No image was found." });
    res.contentType(image.mimetype);
    return res.status(STATUS_CODES.OK).send(image.image);
  } catch (error: any) {
    return res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: error?.message || "Internal server error" });
  }
}

export async function saveImage(
  file: Express.Multer.File
): Promise<mongoose.Types.ObjectId> {
  if (!file) {
    throw new Error("No file provided");
  }
  const image: IImage = new Image();
  image.name = createImageName(file);
  image.mimetype = file.mimetype;
  image.image = file.buffer;
  await image.save();
  return image._id;
}

function createImageName({ originalname }: { originalname: string }): string {
  const fileExtension: string = extname(originalname);
  const fileName: string = originalname.split(fileExtension)[0];
  return `${fileName}_${Date.now()}${fileExtension}`;
}
