import { useSelector } from 'react-redux';
import PersonDetail from './PersonDetail';
import PersonMultiselectDetail from './PersonMultiselectDetail';
import PersonBooleanDetail from './PersonBooleanDetail';
import { formatAdvancedDate, parseAdvancedDate } from '../advanced-dates';
import RelatedPeople from './RelatedPeople';


export default function PersonDetails() {

    const person = useSelector((state) => state.people.selectedPerson);

    
    const birthPlace = person.birth && person.birth.place ? person.birth.place.displayName: null;
    const deathPlace = person.death && person.death.place ? person.death.place.displayName : null;

    const isAlive = !person.death || typeof person.death.isAlive === 'undefined' ||  person.death.isAlive;

    return (
        <>
        <PersonDetail detailId="personDisplayName" 
                      title="Full Name"
                      defaultFieldValue={person.personDisplayName} 
                      updateMaker={(value) => ({personDisplayName: value})}
                      validate={(value) => (value.length < 2 ? "Please enter at least two charachters": null)}/> 

        <PersonDetail detailId="dateOfBith" 
                      title="Date of Birth"
                      defaultFieldValue={person.birth && formatAdvancedDate(person.birth.date)}
                      updateMaker={(value) => ({
                        'birth': {
                            'date': parseAdvancedDate(value)
                        }
                    })}
                        validate={(value) => (parseAdvancedDate(value) || value.trim().length == 0 ? null : "Invalid date format.")}
                     /> 
        
        <PersonDetail detailId="placeOfBirth"
                      title="Birth place"
                      defaultFieldValue={birthPlace}
                      updateMaker={(value) => ({
                        'birth': {'place': {'displayName': value}}
                      })}
                      />

        <PersonBooleanDetail detailId="isAlive"
                             title="Alive"
                             defaultFieldValue={isAlive}
                             updateMaker={(value) => ({death: {isAlive: value}})} 
                             />

        {
            !isAlive && 

            <PersonDetail detailId="dateOfDeath" 
                        title="Date of Death"
                        defaultFieldValue={person.death && formatAdvancedDate(person.death.date)}
                        updateMaker={(value) => ({
                            'death': {
                                'date': parseAdvancedDate(value)
                            }
                        })}
                        validate={(value) => (parseAdvancedDate(value) || value.trim().length == 0 ? null : "Invalid date format.")}
                        /> 

        }


        {
            !isAlive && 

            <PersonDetail detailId="placeOfDeath"
                          title="Death place"
                          defaultFieldValue={deathPlace}
            updateMaker={(value) => ({
              'death': {'place': {'displayName': value}}
            })}
            />

        }
        
        <PersonMultiselectDetail detailId="gender"
                                 title="Gender"
                                 defaultFieldValue={person.gender}
                                 choices={['female', 'male', 'other']}
                                 updateMaker={(value) => ({gender: value})}/>


        <RelatedPeople person={person}/>


    </>
    )


};