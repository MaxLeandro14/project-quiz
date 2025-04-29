import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
// const multerS3 = require('multer-s3');
// const aws = require("aws-sdk");

const uploadPath = path.resolve("tmp", "images", "documents");

if (!fs.existsSync(uploadPath)) {
	fs.mkdirSync(uploadPath, { recursive: true });
  }

const storageTypes = {
	local: multer.diskStorage({
		destination: (req, file, cb) => {
			cb(null, uploadPath)
		},
		filename: (req, file, cb) => {
			crypto.randomBytes(16, (err, hash) => {
				if (err) cb(err)

				const fileName = `${hash.toString('hex')}-${file.originalname}`
				cb(null, fileName)
			})
		}
	}),
	/*s3: multerS3({
	    s3: new aws.S3(
	    	{
	    		accessKeyId: process.env.accessKeyId,
	    		secretAccessKey: process.env.secretAccessKey,
	    		region: process.env.region
	    	}
	    ),
	    bucket: process.env.BUCKET_NAME,
	    contentType: multerS3.AUTO_CONTENT_TYPE,
	    acl: "public-read",
	    key: (req, file, cb) => {
	      crypto.randomBytes(16, (err, hash) => {
	        if (err) cb(err);

	        const fileNamee = `${hash.toString("hex")}-${file.originalname}`;

	        cb(null, fileNamee);
	      });
	    }
  })*/
}

export default {
	dest: uploadPath,
	storage: storageTypes['local'],
	limits: {
		fileSize: 10 * 1024 * 1024
	},
	fileFilter: (req, file, cb) => {
		const allowedMimes = [
			"application/pdf",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			"application/vnd.openxmlformats-officedocument.presentationml.presentation"
		];

		if (allowedMimes.includes(file.mimetype)) {
			cb(null, true)
		} else {
			return cb(new Error("Formato de arquivo não permitido."))
		}
	}
}
