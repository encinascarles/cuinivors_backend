import { Box, Button, FormControl, FormLabel, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useRegisterMutation } from "../slices/userApiSlice";
import { setCredentials } from "../slices/authSlice";
import { toast } from "react-toastify";
import { useUpdateUserMutation } from "../slices/userApiSlice";

const ProfileScreen = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVerify, setPasswordVerify] = useState("");

  const { userInfo } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  const [updateProfile, { isLoading }] = useUpdateUserMutation();

  useEffect(() => {
    setName(userInfo.name);
    setUsername(userInfo.username);
    setEmail(userInfo.email);
  }, [userInfo.email, userInfo.name, userInfo.username]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== passwordVerify) {
      toast.error("Passwords do not match");
    } else {
      try {
        const res = await updateProfile({
          _id: userInfo._id,
          name,
          username,
          email,
          password,
        }).unwrap();
        dispatch(setCredentials({ ...res }));
        toast.success("Profile updated successfully");
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <Box padding="20px">
      <FormLabel>
        <h1>Modifica el perfil</h1>
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
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
          Modifica
        </Button>
      </FormControl>
    </Box>
  );
};

export default ProfileScreen;
