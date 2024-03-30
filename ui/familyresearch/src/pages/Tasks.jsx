import { useState , useEffect } from "react";
import {  useLoaderData, redirect , Form, useParams, useNavigate, Link} from 'react-router-dom';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Fab from '@mui/material/Fab'
import AddIcon from '@mui/icons-material/Add';
import { Dialog, DialogTitle, DialogContent,  TextField, DialogActions, Button} from '@mui/material';
import RemoveCircleOutlineSharpIcon from '@mui/icons-material/RemoveCircleOutlineSharp';
import EditIcon from '@mui/icons-material/Edit';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

import { getTasks, createNewTask, deleteTask, updateTask, fullDisplayName } from "../backend";
import PersonDropdown from "../components/PersonDropdown";

const style = {
        margin: 0,
        top: 'auto',
        right: 20,
        bottom: 20,
        left: 'auto',
        position: 'fixed',
    };

export default function TasksPage() {
    const tasks = useLoaderData();
    const [isNewTaskFormOpen, setNewTaskFormOpen] = useState(false);
    const [newTaskSelectedPerson, setNewTaskSelectedPerson] = useState("");
    const params = useParams();
    const projectId = params.projectId;
    const navigate = useNavigate();

    useEffect(() => {
      if (isNewTaskFormOpen) {
        setNewTaskSelectedPerson("");
      }
    }, [isNewTaskFormOpen]);

    function taskTitle(task) {
      if (task.person)
        return <Link to={`/people/${task.person.personId}`}>{fullDisplayName(task.person)}</Link>
      if (task.task)
        return task.task;
      return "";
    }

    function taskTagline(task) {
      if (task.person && task.task)
        return task.task;
      return "";
    }

    function handleClose() {
        setNewTaskFormOpen(false);
    }

    async function onDeleteTask(taskId) {
      await deleteTask(projectId, taskId);
      navigate(".");
    }

    async function upPriority(taskId, index) {
      const prev = tasks[index-1];
      await updateTask(projectId, taskId, {priority: prev.priority - 1})
      navigate(".");
    }

    async function downPriority(taskId, index) {
      const next = tasks[index+1];
      await updateTask(projectId, taskId, {priority: next.priority + 1})
      navigate(".");
    }


    return (
    <>
    <Fab color="primary" onClick={() => setNewTaskFormOpen(true)}>
        <AddIcon />
    </Fab>

    <List>
        {tasks.map( (task, index) => (
                <ListItem disablePadding key={task.taskId} secondaryAction={
                  <>
                    {index > 0 && <Button  variant="text" size="small"  onClick={()=>upPriority(task.taskId, index)}><ArrowUpwardIcon/></Button>}
                    {index < tasks.length - 1 && <Button  variant="text" size="small" onClick={()=>downPriority(task.taskId, index)}><ArrowDownwardIcon/></Button> }
                    <Button  variant="text" size="small"><EditIcon/></Button> 
                    <Button color="error" variant="text" size="small" onClick={()=>onDeleteTask(task.taskId)}><RemoveCircleOutlineSharpIcon/></Button> 



                  </>
                }
                sx={{borderBottomStyle:'inset'}}
                >
                    <ListItemText 
                    primary={taskTitle(task)} 
                    secondary={taskTagline(task)}
                    />
                </ListItem>
                   
            ) )}
    </List> 
 
      
    <Dialog
          open={isNewTaskFormOpen}
          onClose={handleClose}
        >
          <Form method='POST'>
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
              <PersonDropdown value={newTaskSelectedPerson} setValue={setNewTaskSelectedPerson}/>
              <input type="hidden" name="personId" value={newTaskSelectedPerson ? newTaskSelectedPerson.id : null}/>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit" onClick={handleClose}>Add</Button>
            </DialogActions>
          </Form>
        </Dialog>


    </>);

}

export function loader({ request, params }) {
   return getTasks(params.projectId);
}

export async function action({ request, params }) {
    const formData = await request.formData();
    const name = formData.get("taskDescription");
    const personId = formData.get("personId");
    const task = {task: name};
    if (personId)
      task.personId = personId;
    const newId = await createNewTask(params.projectId, task);

    return redirect(`/projects/${params.projectId}/tasks`);;
}
