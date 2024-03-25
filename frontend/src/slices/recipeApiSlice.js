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
    getUserRecipes: builder.query({
      query: (userId) => `${RECIPES_URL}?user_id=${userId}`,
    }),
  }),
});

export const {
  useAddRecipeMutation,
  useGetUserRecipesQuery,
} = recipeApiSlice;
