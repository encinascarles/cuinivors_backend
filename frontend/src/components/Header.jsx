import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '../slices/userApiSlice';
import { logout } from '../slices/authSlice';
import { toast } from 'react-toastify';

const Header = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const [logoutApiCall] = useLogoutMutation();

  const dispatch = useDispatch();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      toast.success('Logged out successfully');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} href="/">
          CUINIVORS
        </Typography>
        <Button color="inherit">Sign In</Button>
        <Button color="inherit">Sign Up</Button>
        {userInfo && (
          <Button color="inherit" onClick={logoutHandler }>Log Out</Button>
        )}
        
      </Toolbar>
    </AppBar>
  );
};

export default Header;
