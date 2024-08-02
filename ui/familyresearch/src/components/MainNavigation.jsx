import { Link, useLocation, useNavigate, matchPath, generatePath, redirect } from 'react-router-dom';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import FormControl  from '@mui/material/FormControl';
import Select  from '@mui/material/Select';
import MenuItem  from '@mui/material/MenuItem';
import Dialog from "@mui/material/Dialog";
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';


import LogoutButton from "@mui/icons-material/Logout";
import { removeUser } from '../utils';
import { useState } from 'react';
import { getCurrentProjectId, setCurrentProjectId } from '../utils';
import { createNewProject } from '../backend';

function NewForm({open, handleClose, handleNewProject}) {

  return (
      <Dialog
        open={open}
        onClose={handleClose}
      >
        <form method='POST' onSubmit={handleNewProject}>
          <DialogTitle>New Project</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              autoComplete='off'
              required
              margin="dense"
              id="newProjectName"
              name="newProjectName"
              label="Project Name:"
              fullWidth
              variant="standard"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit">Add</Button>
          </DialogActions>
        </form>
      </Dialog>
  );
}

function MainNavigation({user, projects}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  // todo: deal getCurrentProjectId returning null projectId 
  const [selectedProjectId, setSelectedProjectId] = useState(getCurrentProjectId());
  const [isNewProjectFormOpen, setNewProjectFormOpen] = useState(false);

  function logout() {
    removeUser();
    navigate('/login');
  }

  async function handleNewProject(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const newProjectName = formData.get("newProjectName").trim();
    if (newProjectName.length > 0) {
      const newId = await createNewProject(newProjectName);
      projects.push({
        projectId: newId,
        projectDisplayName: newProjectName
      });
      setSelectedProjectId(newId);
      setNewProjectFormOpen(false);
    } 
  }

  function handleProjectSelect(event) {
    const newSelectedProject = event.target.value;

    setCurrentProjectId(newSelectedProject);
    setSelectedProjectId(newSelectedProject);

    const matchAndNavigatePaths = ["/projects/:projectId", "/projects/:projectId/tasks", "/projects/:projectId/people"];

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
      <Tab label="Notes" value="notes" to={`/projects/${selectedProjectId}`} component={Link} />
        <Tab label="People" value="people" to={`/projects/${selectedProjectId}/people`} component={Link} />
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
      <Button onClick={() => setNewProjectFormOpen(true)} >New Project</Button>


      <Tooltip title={user.email}>
        <Button onClick={logout} ><LogoutButton/></Button>
      </Tooltip>

      <NewForm open={isNewProjectFormOpen}  handleClose={() => setNewProjectFormOpen(false)} handleNewProject={handleNewProject}/>

    </Box>

  );
}

export default MainNavigation;