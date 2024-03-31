import mongoose from "mongoose";

const recipeSchema = mongoose.Schema(
  {
    creator_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    prep_time: {
      type: Number,
      required: true,
    },
    total_time: {
      type: Number,
      required: true,
    },
    ingredients: {
      type: [String],
      required: true,
    },
    steps: {
      type: [String],
      required: true,
    },
    recommendations: {
      type: String,
      required: false,
    },
    origin: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
    is_private: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Recipe = mongoose.model("Recipe", recipeSchema);

export default Recipe;
