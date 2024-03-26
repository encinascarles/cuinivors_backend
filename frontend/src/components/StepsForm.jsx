import {
  TextField,
  Box,
  IconButton,
  Paper,
  Typography,
  Chip,
} from "@mui/material";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

const StepsForm = ({ steps, setSteps }) => {
  const handleStepChange = (index, event) => {
    const newSteps = [...steps];
    newSteps[index] = event.target.value;
    setSteps(newSteps);

    // If the last step is being modified and it is not empty, add a new empty step
    if (index === steps.length - 1 && event.target.value !== "") {
      setSteps([...newSteps, ""]);
    }
  };

  const deleteStep = (index) => {
    const newStep = [...steps];
    if (newStep.length > 1) {
      newStep.splice(index, 1);
      setSteps(newStep);
    }
  };

  return (
    <Box
      sx={{
        padding: "10px",
        display: "flex",
        gap: "10px",
        flexDirection: "column",
      }}
    >
      {steps.map((step, index) => (
        <Box key={index} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
          <Chip label={`Pas ${index + 1}`} color="primary" />
          <TextField
            fullWidth
            variant="outlined"
            multiline
            minRows={3}
            value={step}
            onChange={(event) => handleStepChange(index, event)}
          />
          {steps.length > 1 && (
            <IconButton color="secondary" onClick={() => deleteStep(index)}>
              <RemoveCircleOutlineIcon />
            </IconButton>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default StepsForm;
