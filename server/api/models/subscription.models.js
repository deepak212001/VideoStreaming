import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new mongoose.Schema(
    {
        subscriber: {
            type: Schema.Types.ObjectId, // User ID one who is subscribing
            ref: "User"
        },
        channel: {
            type: Schema.Types.ObjectId, // User ID one whom 'subscriber' is subscribing
            ref: "User"
        }
    },
    { timeseries: true }
);

subscriptionSchema.index({ subscriber: 1, channel: 1 }, { unique: true })
subscriptionSchema.index({ channel: 1 })

export const Subscription = mongoose.model("Subscription", subscriptionSchema);