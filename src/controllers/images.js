import {Image} from "../models/image.js";
import {extname} from 'path';


export async function getImage (req, res) {
    try{
        const id = req.params.id;
        const image = await Image.findById(id);
        res.contentType(image.mimetype);
        res.status(200).send(image.image);
    } catch {
        res.status(500).json({message: e.message});
    }
}


export async function saveImage(file){
    if(!file) {
        throw new Error('No file provided');
    }
    let image = new Image();
    image.name = createImageName(file);
    image.mimetype = file.mimetype;
    image.image = file.buffer;
    image = await image.save();
    return image._id;
}

function createImageName(file){
    const fileExtension = extname(file.originalname);
    const fileName = file.originalname.split(fileExtension)[0];
    return `${fileName}_${Date.now()}${fileExtension}`;
}
