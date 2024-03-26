import { useEffect, useState } from "react";
import RecipeForm from "../components/RecipeForm";
import { useParams } from "react-router-dom";
import { useEditRecipeMutation, useGetRecipeQuery } from "../slices/recipeApiSlice";

const EditRecipeScreen = () => {
  const { recipe_id } = useParams(); 
  const { data: recipe } = useGetRecipeQuery(recipe_id);

  const [name, setName] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [totalTime, setTotalTime] = useState("");
  const [ingredients, setIngredients] = useState([""]);
  const [steps, setSteps] = useState([""]);
  const [recomendations, setRecomendations] = useState("");
  const [provenance, setProvenace] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (recipe) {
      setName(recipe.name);
      setPrepTime(recipe.prepTime);
      setTotalTime(recipe.totalTime);
      setIngredients(recipe.ingredients);
      setSteps(recipe.steps);
      setRecomendations(recipe.recomendations);
      setProvenace(recipe.provenance);
    }
  }, [recipe]);

  const [editRecipe, { isLoading: isEditing }] = useEditRecipeMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("prepTime", prepTime);
    formData.append("totalTime", totalTime);
    formData.append("ingredients", JSON.stringify(ingredients));
    formData.append("steps", JSON.stringify(steps));
    formData.append("recomendations", recomendations);
    formData.append("provenance", provenance);
    //file && formData.append("image", file);
    const res = await editRecipe({recipe_id, data: formData}).unwrap();

  };

  return (
    <RecipeForm
      name={name}
      setName={setName}
      prepTime={prepTime}
      setPrepTime={setPrepTime}
      totalTime={totalTime}
      setTotalTime={setTotalTime}
      ingredients={ingredients}
      setIngredients={setIngredients}
      steps={steps}
      setSteps={setSteps}
      recomendations={recomendations}
      setRecomendations={setRecomendations}
      provenance={provenance}
      setProvenace={setProvenace}
      file={file}
      setFile={setFile}
      handleSubmit={handleSubmit}
    />
  );
};

export default EditRecipeScreen;
