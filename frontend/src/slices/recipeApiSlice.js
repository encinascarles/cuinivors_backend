import { apiSlice } from "./apiSlice";
const RECIPES_URL = "/api/recipes";

export const recipeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addRecipe: builder.mutation({
      query: (data) => ({
        url: `${RECIPES_URL}`,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useAddRecipeMutation,
} = recipeApiSlice;
