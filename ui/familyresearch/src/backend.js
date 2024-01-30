
import { PEOPLE_DATA } from "./data"

// todo, switch to using localStore

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
        personId: person.personId, personDisplayName: person.personDisplayName
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
    const maxOldId = Math.max(...Object.keys(people).map(parseInt));
    const newId = (maxOldId + 1).toString();
    people[newId] = {
        personId: newId,
        personDisplayName: personDisplayName
    }
    localStorage.setItem('people', JSON.stringify(people));
    return newId;
}

export function addRelationship(personId1, personId2, role1, role2, relationshipType, note) {
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
        relationshipType: relationshipType,
        note
    }];

    if (!person2.relations)
        person2.relations = []; 

    person2.relations = [...person2.relations, {
        personId: person1.personId,
        personDisplayName: person1.personDisplayName,
        otherPersonRole: role1,
        relationshipType: relationshipType,
        note}];

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