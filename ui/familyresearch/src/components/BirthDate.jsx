
import { useSelector, useDispatch } from 'react-redux';
import { peopleActions } from '../store/people-slice';
import { formatAdvancedDate, parseAdvancedDate } from '../advanced-dates';

export default function BirthDate() {
    
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
        const update = {
            'birth': {
                'date': parseAdvancedDate(editingField.value)
            }
        };
        dispatch(peopleActions.saveFieldEdits(update));
    }

    let formattedDate = '';
    if (person.birth && person.birth.date) 
        formattedDate = formatAdvancedDate(person.birth.date);

 
    let content = '';
    if (editingField && editingField.name === 'birthDate')
    {
        content = (<>
            <input value={editingField.value} onChange={(event) => handleEdit('birthDate', event.target.value)}/>
            <button onClick={() => handleSaveEdit('birthDate')}>Done</button>
            <button onClick={handleCancelEdit}>Cancel</button>
        </>);
    }
    else
    {
        content =  (<>
            <span>{formattedDate}</span> 
            { !editingField ? <button onClick={() => handleEdit("birthDate", formattedDate)}>Edit</button> : null} 
            </>
        );
    }

    return (<p>
        <span>Date of birth: </span>
        {content}
    </p>);

  
}