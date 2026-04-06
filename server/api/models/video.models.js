import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    videoFile: {
      type: String,
      required: true,
    },

    thumbnail: {
      type: String,
      required: true,
    },

    thumbnailPublicId: {
      type: String,
      default: "",
    },

    /** Filmstrip image for hover scrub (optional) */
    storyboardUrl: {
      type: String,
      default: "",
    },

    storyboardPublicId: {
      type: String,
      default: "",
    },

    /** Precomputed hover scrub: time (s) → sprite pixel offset; matches storyboard.jpg grid */
    storyboardMeta: {
      type: [
        {
          time: {type: Number, required: true},
          x: {type: Number, required: true},
          y: {type: Number, required: true},
        },
      ],
      default: [],
    },

    /** Cloudinary folder prefix for bulk raw delete (HLS segments + playlists) */
    hlsRawPrefix: {
      type: String,
      default: "",
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    duration: {
      type: Number, // cloudinary
      required: true,
    },

    view: {
      type: Number,
      default: 0,
    },

    isPublished: {
      type: Boolean,
      default: true,
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

videoSchema.index({owner: 1, isPublished: 1});
videoSchema.index({isPublished: 1, view: -1});
/** Feed list: filter published + newest first (uses _id time order) */
videoSchema.index({isPublished: 1, _id: -1});

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);
