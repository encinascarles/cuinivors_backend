import { Box, Button, FormControl, TextField, Typography } from "@mui/material";
import IngredientForm from "../components/IngredientForm";
import StepsForm from "../components/StepsForm";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import styled from "@emotion/styled";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const RecipeForm = ({
  name,
  setName,
  prepTime,
  setPrepTime,
  totalTime,
  setTotalTime,
  ingredients,
  setIngredients,
  steps,
  setSteps,
  recomendations,
  setRecomendations,
  provenance,
  setProvenace,
  file,
  setFile,
  handleSubmit,
}) => {
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    console.log(event.target.files[0]);
  };

  return (
    <form onSubmit={handleSubmit}>
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
        <Typography
          variant="h6"
          sx={{ margingBottom: "10px", marginTop: "10px" }}
        >
          Imatge
        </Typography>
        <Button
          component="label"
          role={undefined}
          variant="contained"
          tabIndex={-1}
          startIcon={<CloudUploadIcon />}
        >
          Upload file
          <VisuallyHiddenInput type="file" onChange={handleFileChange} />
        </Button>
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

        <Button variant="contained" color="primary" type="submit">
          Guardar
        </Button>
      </Box>
    </form>
  );
};

export default RecipeForm;
