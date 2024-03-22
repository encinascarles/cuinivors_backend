import { Box, Button, FormControl, FormLabel, TextField } from "@mui/material";
import { useState } from "react";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submitHandler = (e) => {
    e.preventDefault();
  };

  return (
    <Box padding="20px">
      <FormLabel>
        <h1>Inicia Sessió</h1>
      </FormLabel>
      <FormControl sx={{width:"100%"}}>
        <TextField variant="outlined" label="Correu electrònic" type="email"></TextField>
        <Box height="20px"></Box>
        <TextField variant="outlined" label="Contrassenya" type="password"></TextField>
        <Box height="20px"></Box>
        <Button variant="contained" color="primary"  onClick={submitHandler}>
          Inicia Sessió
        </Button>
      </FormControl>
    </Box>
  );
};

export default LoginScreen;
