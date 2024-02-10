
import { PEOPLE_DATA, PROJECTS_DATA } from "./data"

import { nicerDate } from "./utils";

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

function getProjectsFromStorage() {
    let projects = localStorage.getItem('projects');
    if (!projects)
    {
        projects = JSON.stringify(PROJECTS_DATA);
        localStorage.setItem('projects', projects);
    }
    return JSON.parse(projects);
}



export function listPeople() {
    const people = getFromStorage();
    return Object.values(people).map(person => ({
        personId: person.personId, personDisplayName: person.personDisplayName, birth: person.birth, death: person.death
    }));
}

export function getPerson(personId) {
    const people = getFromStorage();
    const person = people[personId]
    const projects = Object.values(getProjectsFromStorage());

    person.projects = projects.map((p) => {
        const projectNotes = p.notes ? Object.values(p.notes) : [];

        const filteredNotes = projectNotes.filter((note) => note.content.includes(`(/people/${personId})`));
                           
        if (filteredNotes) {
            return {
                projectId: p.projectId,
                projectDisplayName: p.projectDisplayName,
                notes: filteredNotes
            }
        } 
    }).filter(p => p.notes.length);


    return person;
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

export function addRelationship({personId, otherPersonId, otherPersonRole, relationshipOption}) {
    const people = getFromStorage();
    const person1 = people[personId];
    const person2 = people[otherPersonId];

    // todo, error handling - objects don't exist, relationship already exists
    //   relationship type doesn't match role 
    
    if (!person1.relations)
        person1.relations = [];

    person1.relations = [...person1.relations, {
        personId: person2.personId,
        personDisplayName: person2.personDisplayName,
        otherPersonRole: otherPersonRole,
        relationshipOption,
    }];

    if (!person2.relations)
        person2.relations = []; 

    person2.relations = [...person2.relations, {
        personId: person1.personId,
        personDisplayName: person1.personDisplayName,
        otherPersonRole: roles[otherPersonRole].reverse,
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









export function listProjects() {
    return Object.values(getProjectsFromStorage());
}

export function createNewProject(name) {
    const projects = getProjectsFromStorage();
    const ar = Object.keys(projects).map((s) => parseInt(s));
    const maxOldId = Math.max(...ar);
    const newId = (maxOldId + 1).toString();
    projects[newId] = {
        projectId: newId,
        projectDisplayName: name
    }
    localStorage.setItem('projects', JSON.stringify(projects));
    return newId;    
}

export function getProjectNotes(projectId) {
    const projects = getProjectsFromStorage();    
    const notes = projects[projectId].notes ? Object.values(projects[projectId].notes) : [];
    return notes.map((note) => {
        const copied = {...note};
        copied.created = nicerDate(note.created);
        copied.lastUpdate = nicerDate(note.lastUpdate);
        return copied;
    });
}

export function getNote(projectId, noteId) {
    const projects = getProjectsFromStorage();
    const note = {...projects[projectId].notes[noteId]};
    note.created = nicerDate(note.created);
    note.lastUpdate = nicerDate(note.lastUpdate);
    return note;
}

export function updateNote(projectId, noteId, content) {
    const projects = getProjectsFromStorage();   
    const note = projects[projectId].notes[noteId];
    note.content = content;
    note.lastUpdate = (new Date()).toISOString();
    localStorage.setItem('projects', JSON.stringify(projects));
}

export function createNewNote(projectId, content) {
    const projects = getProjectsFromStorage();
    const project = projects[projectId];
    let noteId = "1";
    if (project.notes) {
        const ar = Object.keys(project.notes).map((s) => parseInt(s));
        const maxOldId = Math.max(...ar);
        noteId = (maxOldId + 1).toString();
    } else {
        project.notes = {};
    }
    const created = (new Date()).toISOString();;
    project.notes[noteId] = {
        noteId,
        content,
        created,
        lastUpdate: created
   };
   localStorage.setItem('projects', JSON.stringify(projects));
}

export function searchPeople(searchBy, maxResults) {
    const people = getFromStorage();

    const re = new RegExp(searchBy, "i");


    return Object.values(people).filter(person => person.personDisplayName.search(re) >= 0).map(person => ({
        personId: person.personId, personDisplayName: person.personDisplayName, birth: person.birth, death: person.death
    })).splice(0, maxResults);

}