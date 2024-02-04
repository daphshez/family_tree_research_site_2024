import { useState } from 'react';
import { peopleActions } from '../store/people-slice';
import { createNewPerson } from '../backend';
import { Form } from 'react-router-dom';

export default function NewPersonForm() {

    // const [errorMessage, setErrorMessage] = useState();

    // function handleSubmit(event) {
    //     event.preventDefault();
    //     const data = new FormData(event.target);
    //     const name = data.get('newPersonName').trim();
    //     if (name.length < 3) {
    //         setErrorMessage("Please enter at least 3 characters.");
    //     } else {
    //         const personId = createNewPerson(name);
    //         dispatch(peopleActions.newPerson({personId: personId, personDisplayName: name}));
    //     }
    // }
//    { errorMessage && <span className="validationError">{errorMessage}</span>}

    return (
        <Form method='POST'>
            <label htmlFor="addPerson">Add a Person</label>
            <input name="newPersonName" id="newPersonName"/>
            <button type="submit">Done</button>
            
        </Form>);
}