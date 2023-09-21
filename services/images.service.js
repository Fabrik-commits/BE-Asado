import {extname} from 'path';
import {Image} from '../models/image.js';


async function saveImage(file){
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

export {saveImage as saveImage};
