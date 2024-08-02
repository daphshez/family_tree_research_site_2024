import { useState } from "react";
import { listPeople } from "../backend";
import { getCurrentProjectId} from "../utils";
import { Link, redirect } from 'react-router-dom';
import { useLoaderData } from 'react-router-dom';
import { createNewPerson, fullDisplayName } from "../backend";

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Fab from '@mui/material/Fab'
import AddIcon from '@mui/icons-material/Add';

import  NewPersonForm  from "../components/NewPersonForm"

const style = {
        margin: 0,
        top: 'auto',
        right: 20,
        bottom: 20,
        left: 'auto',
        position: 'fixed',
    };

export default function PeoplePage() {
    const people = useLoaderData();
    const [isNewPersonFormOpen, setNewPersonFormOpen] = useState(false);

    return (
    <>
     <Fab color="primary" aria-label="add" onClick={() => setNewPersonFormOpen(true)}>
        <AddIcon />
      </Fab>
    <List>
        {people.map( (person) => (
                <ListItem disablePadding key={person.personId}>
                        <ListItemButton component={Link} to={`/people/${person.personId}`}>{fullDisplayName(person)}</ListItemButton>
                </ListItem>
                   
            ) )}
    </List> 
   
    <NewPersonForm open={isNewPersonFormOpen} handleClose={() => setNewPersonFormOpen(false)}/> 
    </>);

}


export function loader({ request, params }) {
    const projectId = params.projectId;
    return listPeople(projectId);
 }

export async function action({ request, params }) {
        const formData = await request.formData();
        const name = formData.get("newPersonName");
        const newId = await createNewPerson(name);
        return redirect(`/people/${newId}`);
}