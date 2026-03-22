import mongoose from 'mongoose';


const likeSchema = new mongoose.Schema(
    {
        video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        },
        comment:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"  
        },
        likeBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    { timeseries: true }
)

likeSchema.index({ video: 1, likeBy: 1 })
likeSchema.index({ comment: 1, likeBy: 1 })
likeSchema.index({ tweet: 1, likeBy: 1 })

export const Like = mongoose.model("Like", likeSchema)