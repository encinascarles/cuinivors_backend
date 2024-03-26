import { useState } from "react";
import { useAddRecipeMutation } from "../slices/recipeApiSlice";
import RecipeForm from "../components/RecipeForm";

const AddRecipeScreen = () => {
  const [name, setName] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [totalTime, setTotalTime] = useState("");
  const [ingredients, setIngredients] = useState([""]);
  const [steps, setSteps] = useState([""]);
  const [recomendations, setRecomendations] = useState("");
  const [provenance, setProvenace] = useState("");
  const [file, setFile] = useState(null);

  const [addRecipe, { isLoading }] = useAddRecipeMutation();

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
    formData.append("image", file);

    const res = await addRecipe(formData).unwrap();
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
      hendleSubmit={handleSubmit}
    />
  );
};

export default AddRecipeScreen;
