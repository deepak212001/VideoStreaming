import fs from "fs";
import mongoose, {isValidObjectId} from "mongoose";
import {Video} from "../models/video.models.js";
import {User} from "../models/user.models.js";
import {Comment} from "../models/comment.models.js";
import {Like} from "../models/like.models.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  deleteOnCloudinary,
  deleteRawByPrefix,
  extractPublicIdFromCloudinaryUrl,
} from "../utils/cloudinary.js";
import {randomUUID} from "crypto";
import {transcodeAndUploadHls} from "../utils/hlsPipeline.js";

const getAllVideos = asyncHandler(async (req, res) => {
  // const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
  // //TODO: get all videos based on query, sort, pagination

  // const pageNumber = +page;
  // const limitNumber = +limit;
  // console.log("they deepak")
  // if (pageNumber < 1 || limitNumber < 1) {
  //     throw new ApiError(
  //         400,
  //         "page number or limit number must be provided as positive numbers"
  //     );
  // }

  // const pipline = [
  //     {
  //         $match: {
  //             ...(query && {
  //                 $or: [
  //                     { title: new RegExp(query, "i") },
  //                     // { description: new RegExp(query, "i") },
  //                 ],
  //             }),
  //             ...(userId && { user: new mongoose.Types.ObjectId(userId) }),
  //         },
  //     },

  //     {
  //         $sort: {
  //             [sortBy || "createdAt"]: sortType === "asc" ? 1 : -1,
  //         },
  //     },
  // ];
  // try {
  //     const options = {
  //         page: pageNumber,
  //         limit: limitNumber,
  //     };
  //     const videos = await Video.aggregatePaginate(pipline, options);
  //     console.log(videos)

  //     return res
  //         .status(200)
  //         .json(new ApiResponse(200, videos, "Videos found successfully"));
  // } catch (error) {
  //     throw new ApiError(500, "Error fetching videos");
  // }

  const {page = 1, limit = 30} = req.query;
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(50, Math.max(1, Number(limit) || 30));
  const filter = {isPublished: true};

  const [videos, totalVideos] = await Promise.all([
    Video.find(filter)
      .sort({createdAt: -1})
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate("owner", "fullName avatar")
      .lean(),
    Video.countDocuments(filter),
  ]);

  if (!videos?.length) {
    return res.status(404).json({
      success: false,
      message: "No videos found",
    });
  }

  res.status(200).json({
    success: true,
    totalVideos,
    currentPage: pageNum,
    totalPages: Math.ceil(totalVideos / limitNum) || 1,
    videos,
  });
});

const publishAVideo = asyncHandler(async (req, res) => {
  const {title, description} = req.body;
  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Title and description are required");
  }

  const videoFilePath = req.files?.videoFile?.[0]?.path;
  const thumbnailPath = req.files?.thumbnail?.[0]?.path;
  if (!videoFilePath || !thumbnailPath) {
    throw new ApiError(400, "Video file and thumbnail are required");
  }

  const assetId = randomUUID();

  try {
    const thumbRes = await uploadOnCloudinary(thumbnailPath);
    if (!thumbRes?.secure_url || !thumbRes.public_id) {
      throw new ApiError(500, "Failed to upload thumbnail");
    }

    const hls = await transcodeAndUploadHls({
      sourceVideoPath: videoFilePath,
      assetId,
    });

    const video = await Video.create({
      title,
      description,
      duration: hls.duration || 0,
      videoFile: hls.masterUrl,
      thumbnail: thumbRes.secure_url,
      thumbnailPublicId: thumbRes.public_id,
      storyboardUrl: hls.storyboardUrl,
      storyboardPublicId: hls.storyboardPublicId,
      storyboardMeta: hls.storyboardUrl ? hls.storyboardMeta || [] : [],
      hlsRawPrefix: hls.hlsRawPrefix,
      owner: req.user?._id,
    });

    const uploadedVideo = await Video.findById(video._id);
    if (!uploadedVideo) {
      throw new ApiError(500, "Video document creation failed");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, uploadedVideo, "Video published successfully"),
      );
  } catch (err) {
    if (err instanceof ApiError) throw err;
    console.error("[publishAVideo]", err);
    throw new ApiError(500, err?.message || "Transcode or upload failed");
  } finally {
    try {
      if (videoFilePath && fs.existsSync(videoFilePath)) {
        fs.unlinkSync(videoFilePath);
      }
    } catch {
      /* ignore */
    }
  }
});

const getVideoById = asyncHandler(async (req, res) => {
  const {videoId} = req.params;
  //TODO: get video by id
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video Id ");
  }

  const video = await Video.findById(videoId).populate(
    "owner",
    "avatar fullName"
  );
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  video.view = video.view + 1;
  const comments = await Comment.find({video: videoId})
    .populate("owner", "avatar fullName username")
    .lean();
  const uid = req.user?._id;
  for (const com of comments) {
    com.likes = await Like.countDocuments({comment: com._id});
    com.isLiked = uid
      ? !!(await Like.findOne({comment: com._id, likeBy: uid}).select("_id").lean())
      : false;
  }
  const likes = await Like.countDocuments({video: videoId});
  let isLiked = false;
  if (req.user) {
    isLiked = await Like.findOne({
      video: videoId,
      likeBy: req.user._id,
    });
    isLiked = isLiked ? true : false;
  }
  await video.save();

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        {video, comments, likes, isLiked},
        "video found successfully"
      )
    );
});

const updateVideo = asyncHandler(async (req, res) => {
  const {videoId} = req.params;
  //TODO: update video details like title, description, thumbnail

  if (!isValidObjectId(videoId)) {
    throw new ApiError(404, "Enter valid video id please");
  }

  const {title, description} = req.body;

  if (!title || !description) {
    throw new ApiError(401, "title and description are required");
  }

  const existingVideo = await Video.findById(videoId);

  if (!existingVideo) {
    throw new ApiError(401, "video not found");
  }

  let thumbnail =
    typeof existingVideo.thumbnail === "string"
      ? existingVideo.thumbnail
      : existingVideo.thumbnail?.url || "";
  let thumbnailPublicId = existingVideo.thumbnailPublicId || "";

  const thumbnailLocal = req.files?.thumbnail?.[0]?.path;

  if (thumbnailLocal) {
    const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocal);
    if (!uploadedThumbnail || !uploadedThumbnail.secure_url) {
      throw new ApiError(501, "thumbnail not uploaded to cloudinary");
    }
    if (thumbnailPublicId) {
      await deleteOnCloudinary(thumbnailPublicId, "image");
    }
    thumbnail = uploadedThumbnail.secure_url;
    thumbnailPublicId = uploadedThumbnail.public_id || "";
  }

  const updateVideosDetail = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: title,
        description: description,
        thumbnail: thumbnail,
        thumbnailPublicId: thumbnailPublicId,
      },
    },
    {
      new: true,
    }
  );
  if (!updateVideosDetail) {
    throw new ApiError(501, "Video details not updated properly");
  }
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        updateVideosDetail,
        "title , description and thumbnail updated sucessfully "
      )
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const {videoId} = req.params;
  //TODO: delete video
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "provide video id please");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  // Check if the user is the owner of the video
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this video");
  }
  if (video.hlsRawPrefix) {
    await deleteRawByPrefix(video.hlsRawPrefix);
  } else if (video.videoFile) {
    const pid = extractPublicIdFromCloudinaryUrl(video.videoFile);
    if (pid) {
      await deleteOnCloudinary(pid, "video");
      await deleteOnCloudinary(pid, "raw");
    }
  }

  if (video.storyboardPublicId) {
    await deleteOnCloudinary(video.storyboardPublicId, "image");
  }

  if (video.thumbnailPublicId) {
    await deleteOnCloudinary(video.thumbnailPublicId, "image");
  } else if (video.thumbnail) {
    const tPid = extractPublicIdFromCloudinaryUrl(video.thumbnail);
    if (tPid) await deleteOnCloudinary(tPid, "image");
  }

  const removeVideo = await Video.findByIdAndDelete(videoId, {
    new: true,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, removeVideo, "Your video remove successfully "));
});

const getVideosByChannel = asyncHandler(async (req, res) => {
  const {channelId} = req.params;
  const {sort = "latest", page = 1, limit = 24} = req.query;

  if (!channelId || !isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel id");
  }

  const ownerExists = await User.findById(channelId).select("_id").lean();
  if (!ownerExists) {
    throw new ApiError(404, "Channel not found");
  }

  let sortOpt = {createdAt: -1};
  if (sort === "oldest") sortOpt = {createdAt: 1};
  if (sort === "popular") sortOpt = {view: -1};

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(50, Math.max(1, Number(limit) || 24));

  const filter = {owner: channelId, isPublished: true};

  const [videos, total] = await Promise.all([
    Video.find(filter)
      .sort(sortOpt)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate("owner", "fullName avatar username")
      .lean(),
    Video.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    videos,
    totalVideos: total,
    currentPage: pageNum,
    totalPages: Math.ceil(total / limitNum) || 1,
  });
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const {videoId} = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid VIdeo ID");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video not found");
  }

  const toggledVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: !video?.isPublished,
      },
    },
    {new: true}
  );

  if (!toggledVideo) {
    throw new ApiError(404, "Video not found & thus no updates made");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, toggledVideo, "Publish status toggled successfully")
    );
});

export {
  getAllVideos,
  getVideosByChannel,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
