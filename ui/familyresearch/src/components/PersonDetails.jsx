
import { useSelector, useDispatch } from 'react-redux';
import { peopleActions } from '../store/people-slice';
import { updatePerson } from '../backend';


export default function PersonDetails() {
    const dispatch = useDispatch();

    const person = useSelector((state) => state.people.selectedPerson);
    const editingField = useSelector((state) => state.people.editingField);

    function handleEdit(fieldName, fieldValue) {
        dispatch(peopleActions.editField({fieldName, fieldValue}));
    }

    function handleCancelEdit() {
        dispatch(peopleActions.cancelEditField());
    }

    function handleSaveEdit() {
        const fieldName = editingField.name;
        const fieldValue = editingField.value;
        console.log(fieldName);
        updatePerson(person.personId, {[fieldName]: fieldValue});
        dispatch(peopleActions.saveFieldEdits());
    }



    if (editingField && editingField.name === 'personDisplayName')
    {
        return <div>
            <input value={editingField.value} onChange={(event) => handleEdit('personDisplayName', event.target.value)}/>
            <button onClick={() => handleSaveEdit('personDisplayName')}>Done</button>
            <button onClick={handleCancelEdit}>Cancel</button>
        </div>;

    } else 
        return (
            <div>
                <p><span>{person.personDisplayName}</span>
                <button onClick={() => handleEdit("personDisplayName", person.personDisplayName)}>Edit</button>
                </p>
            </div>
        )



};