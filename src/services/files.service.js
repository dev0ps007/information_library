import multer from 'multer';

class FilesService {
  constructor() {
    const storage = multer.diskStorage({
      destination(req, file, callback) {
        if (file.fieldname === 'bookImage') {
          callback(null, './uploads/bookImages');
        } else if (file.fieldname === 'bookFile') {
          callback(null, './uploads/bookFiles');
        }
      },
      filename(req, file, callback) {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const fileExtension = file.originalname.split('.').pop();
        callback(null, `${file.fieldname}-${uniqueSuffix}.${fileExtension}`);
      }
    });

    const fileFilter = async (req, file, callback) => {
      if (file.fieldname === 'bookImage') {
        const allowedTypes = ['image/jpg', 'image/png', 'image/jpeg'];
        if (allowedTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      } else if (file.fieldname === 'bookFile') {
        if (file.mimetype === 'application/pdf') {
          callback(null, true);
        } else {
          callback(null, false);
        }
      }
    };

    this.upload = multer({
      storage,
      fileFilter,
      limits: {
        fileSize: Math.pow(1024, 50) * 2 // 50MB
      }
    });
  }
}

export default new FilesService().upload;
