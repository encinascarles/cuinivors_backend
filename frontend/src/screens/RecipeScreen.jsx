import { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import IngredientForm from "../components/IngredientForm";
import StepsForm from "../components/StepsForm";

const RecipeScreen = () => {
  const [name, setName] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [totalTime, setTotalTime] = useState("");
  const [ingredients, setIngredients] = useState([""]);
  const [steps, setSteps] = useState([""]);
  const [recomendations, setRecomendations] = useState("");
  const [provenance, setProvenace] = useState("");

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        m: 1,
      }}
    >
      <TextField
        fullWidth
        label={`Nom de la recepta`}
        variant="outlined"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <TextField
        label={`Temps de preparació (minuts)`}
        variant="outlined"
        value={prepTime}
        onChange={(event) => setPrepTime(event.target.value)}
        type="number"
      />
      <TextField
        label={`Temps total (minuts)`}
        variant="outlined"
        value={totalTime}
        onChange={(event) => setTotalTime(event.target.value)}
        type="number"
      />
      <Typography variant="h6" sx={{ marginBottom: "10px" }}>
        Ingredients
      </Typography>
      <IngredientForm
        ingredients={ingredients}
        setIngredients={setIngredients}
      />
      <Typography
        variant="h6"
        sx={{ margingBottom: "10px", marginTop: "10px" }}
      >
        Preparació
      </Typography>
      <StepsForm steps={steps} setSteps={setSteps} />
      <TextField
        label={`Recomanacions`}
        variant="outlined"
        value={recomendations}
        onChange={(event) => setRecomendations(event.target.value)}
        multiline
        minRows={2}
      />
      <TextField
        label={`Procedencia`}
        variant="outlined"
        value={provenance}
        onChange={(event) => setProvenace(event.target.value)}
        multiline
        minRows={2}
      />
      <Button variant="contained" color="primary">
        Guardar
      </Button>
    </Box>
  );
};

export default RecipeScreen;
