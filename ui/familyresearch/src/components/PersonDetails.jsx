import { useState } from 'react';
import PersonDetail from './PersonDetail';
import PersonBooleanDetail from './PersonBooleanDetail';
import PersonMultiselectDetail from './PersonMultiselectDetail';
import { formatAdvancedDate, parseAdvancedDate } from '../advanced-dates';
import { mergeDeep } from '../utils'
import { updatePerson } from "../backend"
import OverviewNote from './OverviewNote';


export default function PersonDetails({inputPerson}) {

    const [person, setPersonState] = useState(inputPerson);

    if (inputPerson.personId != person.personId)
        setPersonState(inputPerson);

    const birthPlace = person.birth && person.birth.place ? person.birth.place.displayName: null;
    const deathPlace = person.death && person.death.place ? person.death.place.displayName : null;


    function handleUpdate(update) {
        setPersonState((person) => mergeDeep(person, update));
        updatePerson(person.personId, update);
    } 

    return (
        <>
        <PersonDetail detailId="personDisplayName" 
                      title=""
                      defaultFieldValue={person.personDisplayName} 
                      defaultNote={person.personDisplayNameNote}
                      makeUpdate={(value, note) => ({personDisplayName: value, personDisplayNameNote: note})}
                      applyUpdate={handleUpdate}
                      textVariant='h5'
                      validate={(value) => (value.length < 2 ? "Please enter at least two charachters": null)}/> 

        <PersonDetail detailId="dateOfBirth" 
                      title="Date of Birth"
                      defaultFieldValue={person.birth && formatAdvancedDate(person.birth.date)}
                      defaultNote={person.birth && person.birth.dateNote}
                      makeUpdate={(value, note) => ({
                        'birth': {
                            'date': parseAdvancedDate(value),
                            'dateNote': note
                        }
                        })}
                        applyUpdate={handleUpdate}
                        validate={(value) => (parseAdvancedDate(value) || value.trim().length == 0 ? null : "Invalid date format.")}
                     /> 
        
        <PersonDetail detailId="placeOfBirth"
                      title="Birth place"
                      defaultFieldValue={birthPlace}
                      defaultNote={person.birth && person.birth.placeNote}
                      makeUpdate={(value, note) => ({
                        'birth': {'place': {'displayName': value}, 'placeNote': note}
                      })}
                      applyUpdate={handleUpdate}

                      />

        <PersonBooleanDetail detailId="isAlive"
                             title="Alive"
                             defaultFieldValue={person.isAlive}
                             makeUpdate={(value) => ({isAlive: value})} 
                             applyUpdate={handleUpdate}
                             />

        {
            person.isAlive === 'no' && 

            <PersonDetail detailId="dateOfDeath" 
                        title="Date of Death"
                        defaultFieldValue={person.death && formatAdvancedDate(person.death.date)}
                        defaultNote={person.death && person.death.dateNote}
                        makeUpdate={(value, note) => ({
                            'death': {
                                'date': parseAdvancedDate(value),
                                'dateNote': note
                            }
                        })}
                        applyUpdate={handleUpdate}
                        validate={(value) => (parseAdvancedDate(value) || value.trim().length == 0 ? null : "Invalid date format.")}
                        /> 

        }


        {
            person.isAlive === 'no' && 

            <PersonDetail detailId="placeOfDeath"
                          title="Death place"
                          defaultFieldValue={deathPlace}
                          defaultNote={person.death && person.death.placeNote}
                          makeUpdate={(value, note) => ({
                            'death': {'place': {'displayName': value}, 'note': note}
                          })}
                          applyUpdate={handleUpdate}/>

        }

        {
            person.isAlive === 'no' && 


            <PersonDetail detailId="causeOfDeath"
                          title="Cause of death"
                          defaultFieldValue={person.death && person.death.cause}
                          defaultNote={person.death && person.death.causeNote}
                          makeUpdate={(value, note) => ({
                            'death': {'cause': value.trim(), 'note': note}
                          })}
                          applyUpdate={handleUpdate}/>

        }
        
        <PersonMultiselectDetail detailId="gender"
                                 title="Gender"
                                 defaultFieldValue={person.gender}
                                 choices={['female', 'male', 'other']}
                                 applyUpdate={handleUpdate}
                                 makeUpdate={(value) => ({gender: value})}/>

        <OverviewNote content={person.overviewNote} applyUpdate={handleUpdate}/>

        <PersonMultiselectDetail detailId="researchTag"
                                 title="Research Tag"
                                 defaultFieldValue={person.researchTag && person.researchTag.value}
                                 choices={['undocumented', 'horizon']}
                                 applyUpdate={handleUpdate}
                                 makeUpdate={(value) => ({researchTag: {'value': value}})}/>

    </>
    )


};