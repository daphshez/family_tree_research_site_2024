
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

export function updatePerson(personId, update) {
    const people = getFromStorage();
    people[personId] = {...people[personId], ...update};
    console.log(update);
    localStorage.setItem('people', JSON.stringify(people));
}