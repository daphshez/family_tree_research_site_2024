import { useState } from "react";
import { useRouteLoaderData } from 'react-router-dom';

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';


import RemoveCircleOutlineSharpIcon from '@mui/icons-material/RemoveCircleOutlineSharp';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

import { createNewTask as addToBackend, deleteTask as removeFromBackend} from "../backend";


export default function PersonTasks({ person }) {
    const [personId, setPersonId] = useState(person.personId);
    const [tasks, setTasks] = useState(person.tasks || []);
    const [isAddFormOpen, setAddFormOpen] = useState(false);

    const {projects} = useRouteLoaderData("root");


    if (person.personId != personId) {
        setPersonId(person.personId);
        setTasks(person.tasks || []);
    }

    function remove({taskId, projectId}) {
        setTasks(tasks => (tasks.filter((o) => o.taskId != taskId)));
        removeFromBackend(projectId, taskId);
    }


    async function add(projectId,  task) {
        const taskId = await addToBackend(projectId, {task, personId});
        const projectName = projects.filter(p => p.projectId == projectId)[0].projectDisplayName;
        setTasks(tasks => [...tasks, {taskId, projectId, projectName, task}])
    }

    function handleClose() {
        setAddFormOpen(false);
    }

    function handleSubmitNew(event) {
        event.preventDefault();

        const fd = new FormData(event.target);
        const projectId = fd.get("projectId");
        const task = fd.get("taskDescription");
        add(projectId, task);
        handleClose();
    }

    return (
        <Box sx={{
            marginBottom: '20px'
        }}>
        <Typography variant="h6">Tasks</Typography>
        <List>
          
        { 
            tasks.map( 
                (task) => <ListItem key={task.taskId} disablePadding  secondaryAction={
                    <>
                    <Button color="error" variant="text" size="small" onClick={()=>remove(task)}><RemoveCircleOutlineSharpIcon/></Button>
                    <Button  variant="text" size="small"><EditIcon/></Button> 
                    </>   
                }>
                    
                    <ListItemText primary={task.task} secondary={task.projectName}/></ListItem>
            ) 
        } 

        <ListItem disablePadding>
            <ListItemButton onClick={() => setAddFormOpen(true)}><AddIcon/></ListItemButton>
        </ListItem>
        </List> 

        <Dialog
          open={isAddFormOpen}
          onClose={handleClose}
          PaperProps={{
            component: 'form',
            onSubmit: handleSubmitNew
          }}
        >
            <DialogTitle>New Task</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                required
                margin="dense"
                autoComplete="off"
                id="taskDescription"
                name="taskDescription"
                label="What needs doing?"
                fullWidth
                variant="standard"
              />

            <FormControl fullWidth>
            <InputLabel id="dialog-project-select-label">Project</InputLabel>
            <Select
                labelId="dialog-project-select-label"
                id="dialog-project-select"
                name="projectId"
                label="Project"
                defaultValue=""
            >
                {
                    projects.map(p => <MenuItem key={p.projectId} value={p.projectId}>{p.projectDisplayName}</MenuItem>)
                }
            </Select>
            </FormControl>

            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit">Add</Button>
            </DialogActions>
        </Dialog>
       
    </Box>);
}