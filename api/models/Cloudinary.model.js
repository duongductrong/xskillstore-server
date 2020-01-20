/* 
    Built model cloudinary api image
*/
const cloudinary = require("cloudinary").v2;

let config1 = {
    cloud_name: "xskill",
    api_key: "945986318553276",
    api_secret: "nD3j9X_aOcx_m4jM6q999geo1iA"
}
let config2 = {
    cloud_name: "xskill-store",
    api_key: "451788234465945",
    api_secret: "4qF1rDoxVIb6MS4ickJkuUaT9UI"
}
//Config
cloudinary.config(config1);

let options = { type: "upload", max_results: 500 }

let self = module.exports = {
    getResources: () => {
        return new Promise((resolve, reject) => {
            return cloudinary.api.resources(options,(err, result) => {
                if(err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            })
        })
    },
    uploadSingle: (file) => {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload(file, {
                folder: "single"
            })
            .then(res => {
                //After upload image
                if(res) {
                    //Clear image on path local when file was uploaded to cloudinary
                    const fs = require("fs");
                    fs.unlinkSync(file);
                    //Resolve return object image detail
                    resolve({
                        url: res.secure_url,
                        id: res.public_id,
                        size: {
                            width: res.width,
                            height: res.height
                        },
                        format: res.format,
                        alt: res.original_filename
                    })
                }
            })
            .catch(err => {
                require("fs").unlinkSync(file);
                reject(err);
            })
        })
    },
    uploadMulpleFile: (file) => {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload(file, {
                folder: "multipleFile"
            })
            .then(res => {
                if(res) {
                    const fs = require("fs");
                    fs.unlinkSync(file);
                    resolve({
                        url: res.secure_url,
                        id: res.public_id,
                        thumb1: self.reSizeImage(res.public_id, 200, 200),
                        main: self.reSizeImage(res.public_id, 500, 500),
                        thumb2: self.reSizeImage(res.public_id, 300, 300)
                    })
                }
            })
            .catch(err => {
                require("fs").unlinkSync(file);
                reject(err);
            })
        })
    },
    deleteSingleFile: (idfile) => {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(idfile)
            .then(res => {
                resolve(res);
            })
            .catch(err => {
                reject(err);
            })
        })
    },
    deleteMultipleFile: (idFiles) => {
        return new Promise((resolve, reject) => {
            cloudinary.api.delete_resources(idFiles)
            .then(res => {
                resolve(res);
            })
            .catch(err => {
                reject(err);
            })
        })
    },
    reSizeImage: (id, w, h) => {
        return cloudinary.url(id, {
            width: w,
            height: h,
            crop: "scale",
            format: "jpg"
        })
    }
}