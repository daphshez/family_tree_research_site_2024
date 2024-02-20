import { Link, useLocation, useNavigate } from 'react-router-dom';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from "@mui/material/Box";
import { Typography, Button } from '@mui/material';
import LogoutButton from "@mui/icons-material/Logout";
import { removeUser } from '../utils';


function MainNavigation({user}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  
  function logout() {
    removeUser();
    navigate('/login');
  }

  const tab = pathname.startsWith('/projects') ? 'projects' : 'people';


  return (
    <Box sx={{ display: 'flex', justifyItems: 'stretch', alignItems: 'center' }}>
      <Tabs value={tab}>
        <Tab label="People" value="people" to="/" component={Link} />
        <Tab label="Projects" value="projects" to="/projects" component={Link} />
      </Tabs>
      <Typography variant='body2' sx={{marginLeft: 'auto'}}>{user.email}</Typography>
      <Button onClick={logout}><LogoutButton/></Button>
    </Box>
  );
}

export default MainNavigation;