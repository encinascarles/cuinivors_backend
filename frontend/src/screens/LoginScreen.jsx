import { Box, Button, FormControl, FormLabel, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useLoginMutation } from "../slices/userApiSlice";
import { setCredentials } from "../slices/authSlice";
import { toast } from 'react-toastify';

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      navigate("/");
    }
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      console.log("1");
      const res = await login({ email, password }).unwrap();
      console.log("2");
      dispatch(setCredentials({ ...res }));
      console.log("3");
      navigate("/");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <Box padding="20px">
      <FormLabel>
        <h1>Inicia Sessió</h1>
      </FormLabel>
      <FormControl sx={{ width: "100%" }}>
        <TextField
          variant="outlined"
          label="Correu electrònic"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        ></TextField>
        <Box height="20px"></Box>
        <TextField
          variant="outlined"
          label="Contrassenya"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        ></TextField>
        <Box height="20px"></Box>
        <Button variant="contained" color="primary" onClick={submitHandler}>
          Inicia Sessió
        </Button>
      </FormControl>
    </Box>
  );
};

export default LoginScreen;
