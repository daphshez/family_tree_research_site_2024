import { Link } from "react-router-dom"
import { useState, useEffect, useRef } from "react";
import { deleteRelationships } from "../backend"
import AddRelationForm from "./RelatedPeopleAddForm";



export default function RelatedPeople({ person }) {
    const [personId, setPersonId] = useState(person.personId);
    const [relations, setRelations] = useState(person.relations || []);
    const [relationToRemove, setRelationToRemove] = useState();


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
            deleteRelationships([person.personId, relationToRemove]);
            setRelationToRemove(null);
        }
    }, [relationToRemove])

    return (
        <div>
        <header>Related people</header>
        <ul>
            { relations.map((other) => (
                <li key={other.personId}>
                    <Link to={`/people/${other.personId}`}>{other.personDisplayName}</Link> 
                    ({other.otherPersonRole})
                    <button type="button" onClick={()=>removeRelation(other.personId)}>Remove</button>
                    </li>

            ))}
        </ul>

        <AddRelationForm 
        personId={person.personId}
        currentRelations={relations.map((relation) => relation.personId)}
        applyUpdate={addRelation}
        />
       
    </div>
    )
}