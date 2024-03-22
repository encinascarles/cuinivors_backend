import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';


const Header = () => {
  return (
    
      <AppBar position="static">
        <Toolbar>

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} href="/">
            CUINIVORS
          </Typography>
          <Button color="inherit">Sign In</Button>
          <Button color="inherit">Sign Up</Button>
        </Toolbar>
      </AppBar>
    
  );
};

export default Header;