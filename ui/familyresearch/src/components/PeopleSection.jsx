import { useSelector, useDispatch } from 'react-redux';
import { peopleActions } from '../store/people-slice';
import PersonDetails from './PersonDetails';
import NewPersonForm from './NewPersonForm';
import { useEffect } from 'react';
import { listPeople, updatePerson } from '../backend';


export default function PeopleSection() {
    const dispatch = useDispatch();
    const people = useSelector((state) => state.people.people);
    const selectedPerson = useSelector((state) => state.people.selectedPerson);
    const showSelected = useSelector((state) => state.people.showSelected);
    
    
    const personToSend = useSelector((state) => state.people.personToSend);


    // individual components may update the person state slice; once they do, this 
    // top level component is responsible for sending the changes to the backend
    // (See lectures 313-315)
    useEffect(
        () => {
            if (personToSend) {
                updatePerson(personToSend);
                dispatch(peopleActions.updateSentToBE())
            }
        },
        [personToSend]
    );

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
            <NewPersonForm/>
        </section>
    )

    if (showSelected && selectedPerson) {
        const born = selectedPerson.birth && selectedPerson.birth.date && selectedPerson.birth.date.year || "?";
        const isAlive = !selectedPerson.death || typeof selectedPerson.death.isAlive === 'undefined' ||  selectedPerson.death.isAlive;
        let died = '';
        if (!isAlive) died = selectedPerson.death && selectedPerson.death.date && selectedPerson.death.date.year || "?";
        content = (
                <>
                <div><button onClick={handleBackToList}>↤</button>
                                    {selectedPerson.personDisplayName} ({born} - {died})</div>
                                    <PersonDetails/>
                    </>
        )
    }

    return content;
}