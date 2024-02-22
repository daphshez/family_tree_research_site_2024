import { Dialog, DialogTitle, DialogContent,  TextField, DialogActions, Button, FormControl, InputLabel, Select, MenuItem} from '@mui/material';
import { roles, listPeople , addRelationship} from '../backend';
import { useState, useEffect } from 'react';

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export default function AddRelationForm({open, handleClose, personId, currentRelations, applyUpdate}) {

    const [people, setPeople] = useState([]);
    const [selectedRole, setSelectedRole] = useState("");
    
    useEffect(() => {
        listPeople().then((people) => setPeople(people));
    }, []);

    const peopleToInclude = people ? people.filter((person) => person.personId != personId && !currentRelations.includes(person.personId)) : [];


    function onSubmit(event) {
        event.preventDefault();

        const fd = new FormData(event.target);
        const otherPersonId = fd.get("otherPersonId");
        const otherPersonName = peopleToInclude.filter((person) => person.personId === otherPersonId)[0].personDisplayName;

        const relationship = {
            personId,
            otherPersonId,
            otherPersonName,
            otherPersonRole: fd.get("otherPersonRole"),
            relationshipOption: fd.get("roleOptions") || null
        }
        addRelationship(relationship);  // backend update 
        applyUpdate(relationship);      // parent component update 

        setSelectedRole("");
        handleClose();
    }

    const internalHandleClose = () => {
        setSelectedRole("");
        handleClose();
    }

    return (
        <Dialog
          open={open}
          onClose={internalHandleClose}
          PaperProps={{
            component: 'form',
            onSubmit: onSubmit
          }}
        >
            <DialogTitle>Add relation</DialogTitle>
            <DialogContent sx={{display: 'flex', flexDirection: 'column' }}>
            <FormControl variant="standard" sx={{ m: 1, minWidth: 200 }}>
                <InputLabel id="name-select-label">Name</InputLabel>
                <Select
                name="otherPersonId"
                labelId="name-select-label"
                id="name-select-standard"
                label="Name"
                defaultValue="">
                    <MenuItem/>
                    {
                        peopleToInclude.map((person) => 
                            <MenuItem key={person.personId} value={person.personId}>{person.personDisplayName}</MenuItem>
                        )
                    }
                </Select>
            </FormControl>


            <FormControl variant="standard" sx={{ m: 1, minWidth: 200 }}>
                <InputLabel id="role-select-label">Role</InputLabel>
                <Select
                name="otherPersonRole"
                labelId="role-select-label"
                id="role-select-standard"
                label="Role"
                onChange={(event) => setSelectedRole(event.target.value)}
                value={selectedRole}
                >
                    <MenuItem/>
                    { Object.values(roles).map((role) => <MenuItem key={role.value} value={role.value}>{role.title}</MenuItem>)}    
                </Select>
            </FormControl>

            <FormControl variant="standard" sx={{ m: 1, minWidth: 200 }} disabled={selectedRole == ""}>
                <InputLabel id="role-option-select-label">Role Option</InputLabel>
                <Select
                name="roleOptions"
                labelId="role-option-select-label"
                id="role-option-select-standard"
                label="Role Option"
                defaultValue="">
                    <MenuItem/>
                    { selectedRole != "" ? roles[selectedRole].options.map(
                        (option) => <MenuItem value={option} key={option}>{capitalizeFirstLetter(option)}</MenuItem>): undefined}                </Select>
            </FormControl>
           
            </DialogContent>
            <DialogActions>
              <Button onClick={internalHandleClose}>Cancel</Button>
              <Button type="submit">Add</Button>
            </DialogActions>
        </Dialog>
    );
  }