import { STATUS_CODES } from "../constants/httpStatusCode.js";
import { Image } from "../models/image.js";
import { extname } from "path";
import { isValidId } from "../utils/utils.js";
export async function getImage(req, res) {
    try {
        const id = req.params.id;
        if (!isValidId(id))
            return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "No valid id was provided." });
        const image = await Image.findById(id);
        if (!image)
            return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "No image was found." });
        res.contentType(image.mimetype);
        return res.status(STATUS_CODES.OK).send(image.image);
    }
    catch (error) {
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error?.message || "Internal server error" });
    }
}
export async function saveImage(file) {
    if (!file) {
        throw new Error("No file provided");
    }
    const image = new Image();
    image.name = createImageName(file);
    image.mimetype = file.mimetype;
    image.image = file.buffer;
    await image.save();
    return image._id;
}
function createImageName({ originalname }) {
    const fileExtension = extname(originalname);
    const fileName = originalname.split(fileExtension)[0];
    return `${fileName}_${Date.now()}${fileExtension}`;
}
