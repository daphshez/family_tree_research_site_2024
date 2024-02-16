import { Link, useLocation } from 'react-router-dom';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';



function MainNavigation() {

  const { pathname } = useLocation();

  const tab = pathname.startsWith('/projects') ? 'projects' : 'people';


  return (
      <Tabs value={tab}>
        <Tab label="People" value="people" to="/" component={Link} />
        <Tab label="Projects" value="projects" to="/projects" component={Link} />
      </Tabs>
  );
}

export default MainNavigation;