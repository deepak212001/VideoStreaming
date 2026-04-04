import {Router} from "express";
import {
  deleteVideo,
  getAllVideos,
  getVideosByChannel,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controller.js";
import {verifyJWT, verifyAuth} from "../middlewares/auth.middleware.js";
import {upload} from "../middlewares/multer.middleware.js";

const router = Router();
// router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/videos").get(getAllVideos);

router.route("/channel/:channelId").get(verifyAuth, getVideosByChannel);

router
  .route("/upload")
  // .get(verifyJWT, getAllVideos)
  .post(
    verifyJWT,
    upload.fields([
      {
        name: "videoFile",
        maxCount: 1,
      },
      {
        name: "thumbnail",
        maxCount: 1,
      },
    ]),
    publishAVideo
  );

// router
//     .route("/:videoId")
//     .get(getVideoById)
router
  .route("/:videoId")
  .get(verifyAuth, getVideoById)
  .delete(verifyJWT, deleteVideo)
  .patch(verifyJWT, upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:videoId").patch(verifyJWT, togglePublishStatus);

export default router;
