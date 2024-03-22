import { Box, Button, Divider, Typography } from "@mui/material";

const HomeScreen = () => {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" paddingTop="38px" gap="38px" width="100%">
      <Typography sx={{ typography: { md: "h2", xs: "h4" } }}>
        Benvingut a CUINIVORS
      </Typography>
      <Divider sx={{ width: "100%" }} />
      <Button variant="contained" color="primary">
        Inicia sessió
      </Button>
      <Button variant="outlined" color="primary">
        Registra't
      </Button>
    </Box>
  );
};
export default HomeScreen;
