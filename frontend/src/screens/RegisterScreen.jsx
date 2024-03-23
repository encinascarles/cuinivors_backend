import { Box, Button, FormControl, FormLabel, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useRegisterMutation } from '../slices/userApiSlice';
import { setCredentials } from "../slices/authSlice";
import { toast } from 'react-toastify';

const RegisterScreen = () => {
  const [name, setName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVerify, setPasswordVerify] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [register, { isLoading }] = useRegisterMutation();

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      navigate("/");
    }
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== passwordVerify) {
      toast.error('Passwords do not match');
    } else {
      try {
        const res = await register({ name, email, password }).unwrap();
        dispatch(setCredentials({ ...res }));
        navigate('/');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <Box padding="20px">
      <FormLabel>
        <h1>Registra't</h1>
      </FormLabel>
      <FormControl sx={{ width: "100%" }}>
      <TextField
          variant="outlined"
          label="Nom i Cognoms"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        ></TextField>
        <Box height="20px"></Box>
        <TextField
          variant="outlined"
          label="Nom d'usuari"
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        ></TextField>
        <Box height="20px"></Box>
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
        <TextField
          variant="outlined"
          label="Verifica Contrassenya"
          type="password"
          value={passwordVerify}
          onChange={(e) => setPasswordVerify(e.target.value)}
        ></TextField>
        <Box height="20px"></Box>
        <Button variant="contained" color="primary" onClick={submitHandler}>
          Registra't
        </Button>
      </FormControl>
    </Box>
  );
};

export default RegisterScreen;
