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
      query: () => `${RECIPES_URL}/userRecipes/`,
    }),
    getRecipe: builder.query({
      query: (recipeId) => `${RECIPES_URL}/${recipeId}`,
    }),
  }),
});

export const {
  useAddRecipeMutation,
  useGetUserRecipesQuery,
  useGetRecipeQuery,
} = recipeApiSlice;
