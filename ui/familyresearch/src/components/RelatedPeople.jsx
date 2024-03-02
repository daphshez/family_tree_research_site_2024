import { Link } from "react-router-dom"
import { useState, useEffect, useRef } from "react";
import { deleteRelationships } from "../backend"
import AddRelationForm from "./RelatedPeopleAddForm2";
import { Typography , Box, List,ListItem, ListItemButton, Button, Select, MenuItem, FormControl } from "@mui/material";
import RemoveCircleOutlineSharpIcon from '@mui/icons-material/RemoveCircleOutlineSharp';
import AddIcon from '@mui/icons-material/Add';


export default function RelatedPeople({ person }) {
    const [personId, setPersonId] = useState(person.personId);
    const [relations, setRelations] = useState(person.relations || []);
    const [relationToRemove, setRelationToRemove] = useState();
    const [isAddRelationFormOpen, setAddRelationFormOpen] = useState(false);
    

    function removeRelation(removePersonId) {
        setRelations((relations) => (relations.filter((o) => o.personId != removePersonId)));
        setRelationToRemove(removePersonId);
    }


    function addRelation({otherPersonId, otherPersonName, otherPersonRole, relationshipOption}) {
        setRelations((relations) => [...relations, {
            personId: otherPersonId,
            personDisplayName: otherPersonName,
            otherPersonRole,
            relationshipOption
       }])
    }

    if (person.personId != personId) {
        setPersonId(person.personId);
        setRelations(person.relations || []);
    }

    useEffect(() => {
        if (relationToRemove) {
            deleteRelationships(person.personId, relationToRemove);
            setRelationToRemove(null);
        }
    }, [relationToRemove])

    return (
        <Box sx={{
            marginBottom: '20px'
        }}>
        <Typography variant="h6">Related people</Typography>
        <List>
          
        { 
            relations.map( 
            (other) => (
                <ListItem 
                    disablePadding key={other.personId}
                    secondaryAction={
                        other.inferred ? null : 
                        <Button color="error" variant="text" size="small" onClick={()=>removeRelation(other.personId)}><RemoveCircleOutlineSharpIcon/></Button>   
                    }>
                        <ListItemButton 
                           component={Link} 
                           to={`/people/${other.personId}`}>{other.personDisplayName} ({other.otherPersonRole}) 
                        </ListItemButton>
                </ListItem>
                   
            )
            ) } 

        <ListItem disablePadding>
            <ListItemButton onClick={() => setAddRelationFormOpen(true)}><AddIcon/></ListItemButton>
        </ListItem>
        </List> 

        <AddRelationForm 
          personId={person.personId}
          currentRelations={relations.map((relation) => relation.personId)}
          open={isAddRelationFormOpen} 
          applyUpdate={addRelation}
          handleClose={() => setAddRelationFormOpen(false)}/>

       
    </Box>
    )
}