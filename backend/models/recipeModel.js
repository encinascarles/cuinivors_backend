import mongoose from "mongoose";

const recipeSchema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    prepTime: {
      type: Number,
      required: true,
    },
    totalTime: {
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
    recomendations: {
      type: String,
      required: false,
    },
    provenace: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Recipe = mongoose.model("Recipe", recipeSchema);

export default Recipe;
