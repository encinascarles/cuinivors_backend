import { TextField, Box, IconButton, Paper, Typography } from "@mui/material";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

const IngredientForm = ({ ingredients, setIngredients }) => {
  const handleIngredientChange = (index, event) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = event.target.value;
    setIngredients(newIngredients);

    // If the last ingredient is being modified and it is not empty, add a new empty ingredient
    if (index === ingredients.length - 1 && event.target.value !== "") {
      setIngredients([...newIngredients, ""]);
    }
  };

  const deleteIngredient = (index) => {
    const newIngredients = [...ingredients];
    if (newIngredients.length > 1) {
      newIngredients.splice(index, 1);
      setIngredients(newIngredients);
    }
  };

  const handleBlur = (index) => {
    if (ingredients[index] === "") {
      deleteIngredient(index);
    }
  };

  return (
    <Box
      sx={{
        padding: "10px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      {ingredients.map((ingredient, index) => (
        <Box key={index} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <TextField
            fullWidth
            label={ingredient? `Ingredient ${index + 1}` : "Afegir ingredient"}
            variant="outlined"
            value={ingredient}
            onChange={(event) => handleIngredientChange(index, event)}
            onBlur={() => handleBlur(index)}
          />
          {ingredients.length > 1 && (
            <IconButton
              color="secondary"
              onClick={() => deleteIngredient(index)}
            >
              <RemoveCircleOutlineIcon />
            </IconButton>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default IngredientForm;
