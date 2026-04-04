import mongoose, {isValidObjectId} from "mongoose";
import {Video} from "../models/video.models.js";
import {User} from "../models/user.models.js";
import {Comment} from "../models/comment.models.js";
import {Like} from "../models/like.models.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {uploadOnCloudinary, deleteOnCloudinary} from "../utils/cloudinary.js";

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
  // TODO: get video, upload to cloudinary, create video
  const {title, description} = req.body;
  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Title & Description are required fields");
  }
  console.log("file is a video file", req.files);

  const videoFilePath = req.files?.videoFile[0]?.path;
  const thumbnailPath = req.files?.thumbnail[0]?.path;
  if (!videoFilePath || !thumbnailPath) {
    throw new ApiError(400, "Video file & Thumbnail are required fields");
  }
  console.log("The video file path :", videoFilePath);

  const videoFile = await uploadOnCloudinary(videoFilePath);
  const thumbnail = await uploadOnCloudinary(thumbnailPath);
  console.log("The video cloudinary data :", videoFile);
  console.log("The thumbnail cloudinary data :", thumbnail);

  /*
    The video cloudinary data : {
    asset_id: 'acd8f561904d225ebd00eb3398907f7e',
    public_id: 'rxy7tf3xm236j9lofmrr',
    version: 1737527902,
    version_id: 'f1bafa0689402ca175223f94cbde0296',
    signature: '0fd5c1d0a74198ab93ffe0627bcc87385352e380',
    width: 1080,
    height: 1920,
    format: 'mp4',
    resource_type: 'video',
    created_at: '2025-01-22T06:38:22Z',
    tags: [],
    pages: 0,
    bytes: 19012749,
    type: 'upload',
    etag: '4fbe29e901b5c0d1c7ea876e54fb8954',
    placeholder: false,
    url: 'http://res.cloudinary.com/deepak2199/video/upload/v1737527902/rxy7tf3xm236j9lofmrr.mp4',
    secure_url: 'https://res.cloudinary.com/deepak2199/video/upload/v1737527902/rxy7tf3xm236j9lofmrr.mp4',
    playback_url: 'https://res.cloudinary.com/deepak2199/video/upload/sp_auto/v1737527902/rxy7tf3xm236j9lofmrr.m3u8',
    asset_folder: '',
    display_name: 'rxy7tf3xm236j9lofmrr',
    audio: {
        codec: 'aac',
        bit_rate: '128052',
        frequency: 44100,
        channels: 2,
        channel_layout: 'stereo'
    },
    video: {
        pix_format: 'yuv420p',
        codec: 'h264',
        level: 30,
        profile: 'High',
        bit_rate: '5494043',
        time_base: '1/16000'
    },
    is_audio: false,
    frame_rate: 30,
    bit_rate: 5603504,
    duration: 27.144082,
    rotation: 0,
    original_filename: 'VID_500450902_125228_965',
    nb_frames: 813,
    api_key: '631457431334755'
    }



    The thumbnail cloudinary data : {
    asset_id: 'cfeba6581308097249b76b50ee751a35',
    public_id: 'oo3nrzpn2q8k1bmmqnwh',
    version: 1737527904,
    version_id: '098c48dfc38981f1abd44e1fd6f7a1fa',
    signature: '5908168ee8bc8fc7c5cc79ee932927e5571b4ad8',
    width: 1080,
    height: 1920,
    format: 'webp',
    resource_type: 'image',
    created_at: '2025-01-22T06:38:24Z',
    tags: [],
    pages: 1,
    bytes: 135762,
    type: 'upload',
    etag: 'f23a3917cef5524b85c22ec973a0b9ce',
    placeholder: false,
    url: 'http://res.cloudinary.com/deepak2199/image/upload/v1737527904/oo3nrzpn2q8k1bmmqnwh.webp',
    secure_url: 'https://res.cloudinary.com/deepak2199/image/upload/v1737527904/oo3nrzpn2q8k1bmmqnwh.webp',
    asset_folder: '',
    display_name: 'oo3nrzpn2q8k1bmmqnwh',
    original_filename: 'IMG_20240401_175207_164',
    original_extension: 'jpg',
    api_key: '631457431334755'
}

    */
  if (!videoFile || !thumbnail) {
    throw new ApiError(500, "Failed to upload video or thumbnail");
  }

  const video = await Video.create({
    title,
    description,
    duration: videoFile?.duration, // directly available from cloudinary
    videoFile: videoFile?.url,
    thumbnail: thumbnail?.url,
    owner: req.user?._id,
  });

  const uploadedVideo = await Video.findById(video._id); // just verifying to see if the document is actually registered in DB

  if (!uploadedVideo) {
    throw new ApiError(500, "Video document creation failed");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, uploadedVideo, "Video published successfully"));
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

  let thumbnail = existingVideo.thumbnail.url;

  const thumbnailLocal = req.files?.thumbnail[0]?.path;

  if (thumbnailLocal) {
    const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocal);
    if (!uploadedThumbnail || !uploadedThumbnail.url) {
      throw new ApiError(501, "thumbnail not uploaded to cloudinary");
    }
    thumbnail = uploadedThumbnail.url;
  }
  const publicId = existingVideo.thumbnail.public_id;
  const updateVideosDetail = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: title,
        description: description,
        thumbnail: thumbnail,
      },
    },
    {
      new: true,
    }
  );
  if (!updateVideosDetail) {
    throw new ApiError(501, "Video details not updated properly");
  }
  const deleteThumbnailResponse = await deleteOnCloudinary(publicId);
  if (!deleteThumbnailResponse) {
    throw new ApiError(501, "Thumbnail not deleted from cloudinary");
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
  // Delete the video from Cloudinary
  const deleteVideoResponse = await deleteOnCloudinary(
    video.videoFile.public_id
  );
  const deleteThumbnailResponse = await deleteOnCloudinary(
    video.thumbnail.public_id
  );
  if (!deleteVideoResponse || !deleteThumbnailResponse) {
    throw new ApiError(
      500,
      "Failed to delete video or thumbnail from Cloudinary"
    );
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
