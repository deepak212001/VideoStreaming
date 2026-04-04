import { Router } from 'express';
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
    checkSubscripted,
    getMySubscribedChannels,
} from "../controllers/subscription.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/my-channels").get(getMySubscribedChannels);

router
    .route("/c/:channelId")
    .get(getSubscribedChannels)
    .post(toggleSubscription);

router.route("/:channelId").post(checkSubscripted);

router.route("/u/:subscriberId").get(getUserChannelSubscribers);

export default router