import { Box, Button, Divider, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const HomeScreen = () => {
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      paddingTop="38px"
      gap="38px"
      width="100%"
    >
      <Typography sx={{ typography: { md: "h2", xs: "h4" } }}>
        Benvingut a CUINIVORS
      </Typography>
      <Divider sx={{ width: "100%" }} />
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/login")}
      >
        Inicia sessió
      </Button>
      <Button
        variant="outlined"
        color="primary"
        onClick={() => navigate("/register")}
      >
        Registra't
      </Button>
    </Box>
  );
};
export default HomeScreen;
