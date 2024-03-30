import { Link, useLocation, useNavigate, matchPath, generatePath } from 'react-router-dom';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import FormControl  from '@mui/material/FormControl';
import Select  from '@mui/material/Select';
import MenuItem  from '@mui/material/MenuItem';

import LogoutButton from "@mui/icons-material/Logout";
import { removeUser } from '../utils';
import { useState } from 'react';
import { getCurrentProjectId, setCurrentProjectId } from '../utils';


function MainNavigation({user, projects}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  // todo: deal getCurrentProjectId returning null projectId 
  const [selectedProjectId, setSelectedProjectId] = useState(getCurrentProjectId());

  function logout() {
    removeUser();
    navigate('/login');
  }

  function handleProjectSelect(event) {
    const newSelectedProject = event.target.value;
    setCurrentProjectId(newSelectedProject);
    setSelectedProjectId(newSelectedProject);

    const matchAndNavigatePaths = ["/projects/:projectId", "/projects/:projectId/tasks"];

    for (let pathToMatch of matchAndNavigatePaths) {
      const match = matchPath(pathToMatch, pathname);
      if (match) {
        navigate(generatePath(pathToMatch, { projectId: newSelectedProject }));
      }
    }
  }

  let tab = 'people';
  if (matchPath("/projects/:projectId", pathname)) {
    tab = 'notes';
  } else if (matchPath("/projects/:projectId/tasks", pathname)) {
    tab = 'tasks';
  }

  return (
    <Box sx={{ display: 'flex', justifyItems: 'stretch', alignItems: 'center' }}>
      <Tabs value={tab}>
        <Tab label="People" value="people" to="/" component={Link} />
        <Tab label="Notes" value="notes" to={`/projects/${selectedProjectId}`} component={Link} />
        <Tab label="Tasks" value="tasks" to={`/projects/${selectedProjectId}/tasks`} component={Link} />

      </Tabs>
      <FormControl  variant="standard" sx={{ m: 1, width: 250, marginLeft: 'auto' }}>
        <Select
          labelId="project-select-label"
          id="project-select"
          value={selectedProjectId || ""}
          label="Project"
          onChange={handleProjectSelect}>
            {
              projects.map(project => (
                <MenuItem key={project.projectId} value={project.projectId}>{project.projectDisplayName}</MenuItem>
              ))
            }
          
        </Select>
      </FormControl>
      <Tooltip title={user.email}>
        <Button onClick={logout} ><LogoutButton/></Button>
      </Tooltip>
    </Box>
  );
}

export default MainNavigation;