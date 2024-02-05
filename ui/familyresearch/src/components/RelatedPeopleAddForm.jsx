import { useState, useEffect } from "react";
import { roles, listPeople , addRelationship} from '../backend';

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export default function AddRelationForm({personId, currentRelations, applyUpdate})
{
    const [people, setPeople] = useState([]);
    const [selectedRole, setSelectedRole] = useState("");

    useEffect(() => {
        setPeople(listPeople());
    }, []);

    const peopleToInclude = people.filter((person) => person.personId != personId && !currentRelations.includes(person.personId));

    function onSubmit(event) {
        // todo, validation 
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
        event.target.reset();
    }


    return (
        <>
        <header>Add relation</header>
        <form onSubmit={onSubmit}>
            <label htmlFor="otherPersonId">Other person:</label>
            <select name="otherPersonId"> 
                <option value=""></option>
                {
                    peopleToInclude.map((person) => 
                        <option key={person.personId} value={person.personId}>{person.personDisplayName}</option>
                    )
                }
            </select>



            <label htmlFor="otherPersonRole">Other person relationship:</label>
            <select name="otherPersonRole" value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)}>
                <option value=""></option>
                { Object.values(roles).map((role) => <option key={role.value} value={role.value}>{role.title}</option>)}
            </select>

            { selectedRole && (<>
                <label htmlFor="roleOptions">Role options:</label>
                <select name="roleOptions">
                <option value=""></option>
                { roles[selectedRole].options.map((option) => <option value={option} key={option}>{capitalizeFirstLetter(option)}</option>)}
            </select>
            </>)}

            <button>Submit</button>

            </form>
            </>
    )
}