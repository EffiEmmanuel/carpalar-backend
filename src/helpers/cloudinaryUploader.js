import cloudinary from "../config/cloudinary.config.js";

export const uploadToCloudinary = async (filePath) => {
    const cloudinaryUploadDetails = await cloudinary.uploader.upload(filePath)
    return cloudinaryUploadDetails
}