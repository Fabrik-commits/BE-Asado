import { STATUS_CODES } from "../constants/httpStatusCode.js";
import { Image } from "../models/image.js";
import { extname } from "path";

export async function getImage(req, res) {
  try {
    const id = req.params.id;
    const image = await Image.findById(id);
    if (!image) return res.status(STATUS_CODES.BAD_REQUEST).json({message: "No image was found."})
    res.contentType(image.mimetype);
    res.status(STATUS_CODES.OK).send(image.image);
  } catch {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: e.message });
  }
}

export async function saveImage(file) {
  if (!file) {
    throw new Error("No file provided");
  }
  let image = new Image();
  image.name = createImageName(file);
  image.mimetype = file.mimetype;
  image.image = file.buffer;
  image = await image.save();
  return image._id;
}

function createImageName({ originalname }) {
  const fileExtension = extname(originalname);
  const fileName = originalname.split(fileExtension)[0];
  return `${fileName}_${Date.now()}${fileExtension}`;
}
