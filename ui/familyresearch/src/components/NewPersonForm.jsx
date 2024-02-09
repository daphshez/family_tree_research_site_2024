import { Form } from 'react-router-dom';

export default function NewPersonForm() {
    return (
        <Form method='POST'>
            <label htmlFor="addPerson">Add a Person</label>
            <input name="newPersonName" id="newPersonName"/>
            <button type="submit">Done</button>
            
        </Form>);
}