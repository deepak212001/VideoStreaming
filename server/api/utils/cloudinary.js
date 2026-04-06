import { v2 as cloudinary } from "cloudinary"
import fs from "fs"
// fs means file system helps to read write move
// fs is a core module of node.js that allows you to work with the file system on your computer


// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
// it's helps to upload files



const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null

        //upload the file on cloudinary

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //file has been uploded successfull
        // console.log("File is upload on cloudinary", response.url)
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath)
        // remove the locally saved temporary file as the upload opertion got failed
        console.error("Error uploading file to Cloudinary:", error);
        return null;
    }
}


const deleteOnCloudinary = async (publicId, resourceType = "image") => {
    try {
        if (!publicId) return null
        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
        })
        return response;
    } catch (error) {
        return null;
    }
}

/** Upload with optional folder/public_id; set unlinkAfter: false to keep local file */
const uploadFileToCloudinary = async (localFilePath, options = {}) => {
    const {
        resource_type = "auto",
        folder,
        public_id,
        unlinkAfter = true,
    } = options;
    try {
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type,
            folder,
            public_id,
            use_filename: false,
            unique_filename: false,
            overwrite: true,
        });
        if (unlinkAfter && fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        if (unlinkAfter && fs.existsSync(localFilePath)) {
            try {
                fs.unlinkSync(localFilePath);
            } catch {
                /* ignore */
            }
        }
        console.error("Cloudinary upload error:", error);
        return null;
    }
};

/** Deletes all raw assets whose public_id starts with prefix (HLS .ts + .m3u8) */
const deleteRawByPrefix = async (prefix) => {
    try {
        if (!prefix) return null;
        return await cloudinary.api.delete_resources_by_prefix(prefix, {
            resource_type: "raw",
        });
    } catch (error) {
        console.error("deleteRawByPrefix:", error);
        return null;
    }
};

/** Path segment after /upload/…/ — strip extension for destroy() */
function extractPublicIdFromCloudinaryUrl(url) {
    if (!url || typeof url !== "string") return null;
    const noQuery = url.split("?")[0];
    const m = noQuery.match(/\/upload\/(?:v\d+\/)?(.+)$/);
    if (!m) return null;
    let pid = decodeURIComponent(m[1]);
    return pid.replace(/\.[^/.]+$/, "");
}

export {
    uploadOnCloudinary,
    deleteOnCloudinary,
    uploadFileToCloudinary,
    deleteRawByPrefix,
    extractPublicIdFromCloudinaryUrl,
}




// cloudinary.v2.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//     { public_id: "olympic_flag" },
//     function (error, result) { console.log(result); }
// )
