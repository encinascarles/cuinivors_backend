import { useEffect, useState } from "react";
import {useParams} from "react-router-dom";
import { useGetRecipeQuery } from "../slices/recipeApiSlice";

const ShowRecipeScreen = () => {
    const { recipe_id } = useParams(); 
    const [recipe, setRecipe] = useState(null);
  
    const { data, error } = useGetRecipeQuery(recipe_id);

    useEffect(() => {
        if (error) {
            console.log("Failed to fetch recipe");
        } else if (data) {
            setRecipe(data);
            console.log(data);
        }
    }
    , [data, error]);
    return (
        <div>
            {recipe && (
                <div>
                    <h1>{recipe.name}</h1>
                    <p>{recipe.prepTime}</p>
                    <p>{recipe.totalTime}</p>
                    <p>{recipe.ingredients}</p>
                    <p>{recipe.steps}</p>
                    <p>{recipe.recomendations}</p>
                    <p>{recipe.provenance}</p>
                    <img src={recipe.image} alt={recipe.name} />
                </div>
            )}
        </div>
    );
}

export default ShowRecipeScreen; 