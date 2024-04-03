import mongoose from "mongoose";

const recipeSchema = mongoose.Schema(
  {
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
    recipe_image: {
      type: String,
      required: true,
      default: "/images/recipes/default.jpg",
    },
    visibility: {
      type: String,
      enum: ["private", "public", "family"],
      required: true,
      default: "family",
    },
    author_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Recipe = mongoose.model("Recipe", recipeSchema);

export default Recipe;
