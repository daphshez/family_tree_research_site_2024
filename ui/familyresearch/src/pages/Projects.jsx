import { listProjects, createNewProject } from "../backend";
import { useLoaderData, Link, Form , redirect} from "react-router-dom";
import { useState } from "react";
import { List, ListItem, ListItemButton, Fab} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { Dialog, DialogTitle, DialogContent,  TextField, DialogActions, Button, Breadcrumbs, Typography} from '@mui/material';


function NewForm({open, handleClose}) {

  return (
      <Dialog
        open={open}
        onClose={handleClose}
      >
        <Form method='POST'>
          <DialogTitle>New Project</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
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
        </Form>
      </Dialog>
  );
}

export default function ProjectsPage() {
  const projects = useLoaderData();
  const [isNewProjectFormOpen, setNewProjectFormOpen] = useState(false);

  return (
    <>
        <Breadcrumbs aria-label="breadcrumb">
      
        <Typography color="text.primary">Projects</Typography>
        </Breadcrumbs>

    <List>
        {projects.map( (p) => (
                <ListItem disablePadding key={p.projectId}>
                        <ListItemButton component={Link} to={`/projects/${p.projectId}`}>{p.projectDisplayName} ({p.nNotes})</ListItemButton>
                </ListItem>
                   
            ) )}
    </List> 
    <Fab color="primary" aria-label="add" onClick={() => setNewProjectFormOpen(true)}>
        <AddIcon />
      </Fab>
      <NewForm open={isNewProjectFormOpen}  handleClose={() => setNewProjectFormOpen(false)}/>
    </>);

  }

  export function loader() {
    return listProjects();
 }  


 export async function action({ request, params }) {
  const formData = await request.formData();
  const name = formData.get("newProjectName");
  const newId = createNewProject(name);
  return redirect(`/projects/${newId}`);
}