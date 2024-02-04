
import { PEOPLE_DATA } from "./data"

export function isAlive(person) {
    return !person.death || typeof person.death.isAlive === 'undefined' ||  person.death.isAlive;
}

function birthYear(person) { 
    return person.birth && person.birth.date && person.birth.date.year || "?";
}

function deathYear(person) {
    return isAlive(person) ? '' : person.death && person.death.date && person.death.date.year || "?"
}

export function fullDisplayName(person) {
    return  `${person.personDisplayName} (${birthYear(person)} - ${deathYear(person)})`
}

function getFromStorage() {
    let people = localStorage.getItem('people');
    if (!people)
    {
        people = JSON.stringify(PEOPLE_DATA);
        localStorage.setItem('people', people);
    }
    return JSON.parse(people);
}

export function listPeople() {
    const people = getFromStorage();
    return Object.values(people).map(person => ({
        personId: person.personId, personDisplayName: person.personDisplayName, birth: person.birth, death: person.death
    }));
}

export function getPerson(personId) {
    const people = getFromStorage();
    return people[personId];
}

export function updatePerson(person) {
    const people = getFromStorage();
    people[person.personId] = person;
    localStorage.setItem('people', JSON.stringify(people));
}

export function createNewPerson(personDisplayName) {
    const people = getFromStorage();
    const ar = Object.keys(people).map((s) => parseInt(s));
    const maxOldId = Math.max(...ar);
    const newId = (maxOldId + 1).toString();
    people[newId] = {
        personId: newId,
        personDisplayName: personDisplayName
    }
    localStorage.setItem('people', JSON.stringify(people));
    return newId;
}

export const roles = {
    partner: {value: 'partner', title: 'Partner', options: ['married', 'unmarried', 'divorced'], reverse: 'partner'},
    parent: {value: 'parent', title: 'Parent', options: ['biological', 'adoptive', 'step'], 'reverse': 'child'},
    child: {value: 'child', title: 'Child', options: ['biological', 'adoptive', 'step'], 'reverse': 'parent'},
    sibling: {value: 'sibling', title: 'Sibling', options: ['biological', 'adoptive', 'step', 'half'], 'reverse': 'sibling'},
};


export function addRelationship(personId1, personId2, role2, relationshipOption) {
    const people = getFromStorage();
    const person1 = people[personId1];
    const person2 = people[personId2];

    // todo, error handling - objects don't exist, relationship already exists
    //   relationship type doesn't match role 
    
    if (!person1.relations)
        person1.relations = [];

    person1.relations = [...person1.relations, {
        personId: person2.personId,
        personDisplayName: person2.personDisplayName,
        otherPersonRole: role2,
        relationshipOption,
    }];

    if (!person2.relations)
        person2.relations = []; 

    person2.relations = [...person2.relations, {
        personId: person1.personId,
        personDisplayName: person1.personDisplayName,
        otherPersonRole: roles[role2].reverse,
        relationshipOption}];

    localStorage.setItem('people', JSON.stringify(people));
}

export function deleteRelationships(people) {
    // todo, error handling 
    const allPeople = getFromStorage();

    people.map((personId) => allPeople[personId])
          .forEach((person) => {
              person.relations = (person.relations || []).filter((relation) => !people.includes(relation.personId))
          });

    localStorage.setItem('people', JSON.stringify(allPeople));
}

