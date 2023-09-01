import multer from 'multer';


const MIMETYPES = ["image/jpeg", "image/png", "application/pdf"];

const multerUpload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (MIMETYPES.includes(file.mimetype)) cb(null, true)
        else cb(new Error(`Only ${MIMETYPES.join(' - ')} mimetypes are allowed.`))
    },
    limits: {
        fieldSize: 10000000
    }
});


export {multerUpload as multerUpload};
