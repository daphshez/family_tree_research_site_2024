import { useState } from 'react';
import PersonDetail from './PersonDetail';
import PersonBooleanDetail from './PersonBooleanDetail';
import PersonMultiselectDetail from './PersonMultiselectDetail';
import { formatAdvancedDate, parseAdvancedDate } from '../advanced-dates';
import { mergeDeep } from '../utils'
import { updatePerson } from "../backend"


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
                      makeUpdate={(value) => ({personDisplayName: value})}
                      applyUpdate={handleUpdate}
                      textVariant='h5'
                      validate={(value) => (value.length < 2 ? "Please enter at least two charachters": null)}/> 

        <PersonDetail detailId="dateOfBith" 
                      title="Date of Birth"
                      defaultFieldValue={person.birth && formatAdvancedDate(person.birth.date)}
                      makeUpdate={(value) => ({
                        'birth': {
                            'date': parseAdvancedDate(value)
                        }
                    })}
                    applyUpdate={handleUpdate}

                        validate={(value) => (parseAdvancedDate(value) || value.trim().length == 0 ? null : "Invalid date format.")}
                     /> 
        
        <PersonDetail detailId="placeOfBirth"
                      title="Birth place"
                      defaultFieldValue={birthPlace}
                      makeUpdate={(value) => ({
                        'birth': {'place': {'displayName': value}}
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
                        makeUpdate={(value) => ({
                            'death': {
                                'date': parseAdvancedDate(value)
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
                          makeUpdate={(value) => ({
              'death': {'place': {'displayName': value}}
            })}
            applyUpdate={handleUpdate}

            />

        }
        
        <PersonMultiselectDetail detailId="gender"
                                 title="Gender"
                                 defaultFieldValue={person.gender}
                                 choices={['female', 'male', 'other']}
                                 applyUpdate={handleUpdate}
                                 makeUpdate={(value) => ({gender: value})}/>




    </>
    )


};