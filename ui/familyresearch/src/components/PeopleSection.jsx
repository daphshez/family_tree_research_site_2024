import { useSelector, useDispatch } from 'react-redux';
import { peopleActions } from '../store/people-slice';
import PersonDetails from './PersonDetails';



export default function PeopleSection() {
    const dispatch = useDispatch();
    const people = useSelector((state) => state.people.people);
    const selectedPerson = useSelector((state) => state.people.selectedPerson);
    const showSelected = useSelector((state) => state.people.showSelected);

    function handleSelectPerson(person) {
        dispatch(peopleActions.select({personId: person.personId}));
    }

    function handleBackToList() {
        dispatch(peopleActions.hideSelected());
    }

    let content = (
        <section id="people">
            <div className="list-group">
                {people.map( (personData) => (
                        <a href="#" 
                        className="list-group-item" 
                        key={personData.personId} 
                        onClick={() => handleSelectPerson(personData)}>{ personData.personDisplayName}</a> 
                ) )}
            </div>
        </section>
    )

    if (showSelected && selectedPerson)
        content = (
                <>
                <div><button onClick={handleBackToList}>↤</button>
                                    {selectedPerson.personDisplayName}</div>
                                    <PersonDetails/>
                    </>
        )

    return content;
}