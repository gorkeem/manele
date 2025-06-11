import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";
import cloudinary from "../lib/cloudinary.js";

// Helper function to upload files to Cloudinary
export const uploadToCloudinary = async (file) => {
    try {
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            resource_type: "auto",
        });
        return result.secure_url;
    } catch (error) {
        console.log("Error in uploadToCloudinary:", error);
        throw new Error("Failed to uplaod file to Cloudinary");
    }
};

// Controller to check if the user is an admin
export const checkAdmin = async (req, res, next) => {
    res.status(200).json({
        admin: true,
    });
};

// Controller to handle song creation
export const createSong = async (req, res, next) => {
    try {
        if (!req.files || !req.files.audioFile || !req.files.imageFile) {
            return res
                .status(400)
                .json({ message: "Audio file and image file are required." });
        }
        const { title, artist, albumId, duration } = req.body;
        const audioFile = req.files.audioFile;
        const imageFile = req.files.imageFile;

        const audioUrl = await uploadToCloudinary(audioFile);
        const imageUrl = await uploadToCloudinary(imageFile);

        const song = new Song({
            title,
            artist,
            albumUrl,
            imageUrl,
            duration,
            albumId: albumId || null,
        });

        await song.save();

        // If song is associated with an album, update the album's songs array
        if (albumId) {
            await Album.findByIdAndUpdate(albumId, {
                $push: { songs: song._id },
            });
        }
        res.status(201).json({
            message: "Song created successfully",
            song,
        });
    } catch (error) {
        console.log("Error creating song:", error);
        next(error);
    }
};

// Controller to handle song deletion
export const deleteSong = async (req, res, next) => {
    try {
        const { id } = req.params;
        const song = await Song.findById(id);
        if (!song) {
            return res.status(404).json({ message: "Song not found." });
        }

        if (song.albumId) {
            // If the song is part of an album, remove it from the album's songs array
            await Album.findByIdAndUpdate(song.albumId, {
                $pull: { songs: song._id },
            });
        }
        //  Delete the song from the database
        await Song.findByIdAndDelete(id);

        res.status(200).json({
            message: "Song deleted successfully",
        });
    } catch (error) {
        console.log("Error in deleteSong:", error);
        next(error);
    }
};

// Controller to handle album creation
export const createAlbum = async (req, res, next) => {
    try {
        const { title, artist, releaseYear } = req.body;
        const { imageFile } = req.files;

        const imageUrl = await uploadToCloudinary(imageFile);
        const album = new Album({
            title,
            artist,
            imageUrl,
            releaseYear,
        });
        await album.save();
        res.status(201).json({
            message: " Album created successfully",
            album,
        });
    } catch (error) {
        console.log("Error in createAlbum:", error);
        next(error);
    }
};

// Controller to handle album deletion
export const deleteAlbum = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Album ID is required." });
        }
        await Song.deleteMany({ albumId: id });
        await Album.findByIdAndDelete(id);
        res.status(200).json({
            message: "Album deleted successfully",
        });
    } catch (error) {
        console.log("Error in deleteAlbum:", error);
        next(error);
    }
};
