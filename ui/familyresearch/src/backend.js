import { nicerDate, saveUser } from "./utils";

const serverLocation = 'http://localhost:5000'


function birthYear(person) { 
    return person.birth && person.birth.date && person.birth.date.year || "?";
}

function deathYear(person) {
    return person.isAlive != 'no' ? '' : person.death && person.death.date && person.death.date.year || "?"
}

export function fullDisplayName(person) {
    return person.isAlive != 'no' ? `${person.personDisplayName} (b. ${birthYear(person)})` :
      `${person.personDisplayName} (${birthYear(person)} - ${deathYear(person)})`;
}


export const roles = {
    partner: {value: 'partner', title: 'Partner', options: ['married', 'unmarried', 'divorced'], reverse: 'partner'},
    parent: {value: 'parent', title: 'Parent', options: ['biological', 'adoptive', 'step'], 'reverse': 'child'},
    child: {value: 'child', title: 'Child', options: ['biological', 'adoptive', 'step'], 'reverse': 'parent'},
    sibling: {value: 'sibling', title: 'Sibling', options: ['biological', 'adoptive', 'step', 'half'], 'reverse': 'sibling'},
};



//////////////////////////////////////////

export async function login(email, password) {
    const authData = {email, password};
    
    const response = await fetch(`${serverLocation}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authData),
      });
    
      if (response.status === 422 || response.status === 401) {
        return response;
      }
    
      if (!response.ok) {
        throw json({ message: 'Could not authenticate user.' }, { status: 500 });
      }
    
      const resData = await response.json();
    
      saveUser(resData);
  
}


export async function listProjects() {
    const response = await fetch(`${serverLocation}/api/projects`);
    const resData = await response.json();
  
    if (!response.ok) {
      throw new Error('Failed to fetch places');
    }
  
    return resData.projects;
}


export async function createNewProject(name) {
    const response = await fetch(`${serverLocation}/api/projects/create`, {
        method: 'PUT',
        body: JSON.stringify({ projectDisplayName: name }),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const resData = await response.json();

    if (!response.ok) {
        throw new Error('Failed to update user data.');
    }

    return resData.projectId;
}


export async function getProject(projectId) {
    const response = await fetch(`${serverLocation}/api/projects/${projectId}`);
    const resData = await response.json();
  
    if (!response.ok) {
      throw new Error('Failed to fetch places');
    }

    if (resData.notes) {
        resData.notes = resData.notes.map((note) => ({...note, created: nicerDate(note.created), lastUpdate: nicerDate(note.lastUpdate)}));
    }
  
    return resData;
}

export async function createNewNote(projectId, content) {
    const response = await fetch(`${serverLocation}/api/projects/${projectId}/notes/create`, {
        method: 'PUT',
        body: JSON.stringify({ content }),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const resData = await response.json();

    if (!response.ok) {
        throw new Error('Failed to update user data.');
    }

    return resData.noteId;
}

export async function getNote(projectId, noteId) {
    const response = await fetch(`${serverLocation}/api/projects/${projectId}/notes/${noteId}`);
    const resData = await response.json();
  
    if (!response.ok) {
      throw new Error('Failed to fetch places');
    }

    resData.created = nicerDate(resData.created);
    resData.lastUpdate = nicerDate(resData.lastUpdate);
  
    return resData;
}


export async function updateNote(projectId, noteId, content) {
    const response = await fetch(`${serverLocation}/api/projects/${projectId}/notes/${noteId}`, {
        method: 'POST',
        body: JSON.stringify({ content }),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const resData = await response.json();
  
    if (!response.ok) {
      throw new Error('Failed to fetch places');
    }
}


export async function listPeople() {
    const response = await fetch(`${serverLocation}/api/people`);
    const resData = await response.json();
  
    if (!response.ok) {
      throw new Error('Failed to fetch places');
    }
  
    return resData.people;
}

export async function searchPeople(searchBy, maxResults) {
    const response = await fetch(`${serverLocation}/api/people/search`, {
        method: 'POST',
        body: JSON.stringify({ searchTerm: searchBy, maxResults }),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const resData = await response.json();
  
    if (!response.ok) {
      throw new Error('Failed to fetch places');
    }
  
    return resData.people;
}

export async function createNewPerson(name) {
    const response = await fetch(`${serverLocation}/api/people/create`, {
        method: 'PUT',
        body: JSON.stringify({ personDisplayName: name }),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const resData = await response.json();

    if (!response.ok) {
        throw new Error('Failed to update user data.');
    }

    return resData.personId;
}

export async function getPerson(personId) {
    const response = await fetch(`${serverLocation}/api/people/${personId}`);
    const resData = await response.json();
  
    if (!response.ok) {
      throw new Error('Failed to fetch places');
    }

    if (resData.notes) {
        resData.notes = resData.notes.map((note) => ({...note, created: nicerDate(note.created), lastUpdate: nicerDate(note.lastUpdate)}));
    }
  
    return resData;
}

export async function updatePerson(personId, update) {
    const response = await fetch(`${serverLocation}/api/people/${personId}`, {
        method: 'POST',
        body: JSON.stringify(update),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const resData = await response.json();
  
    if (!response.ok) {
      throw new Error('Failed to fetch places');
    }

}

export async function addRelationship({personId, otherPersonId, otherPersonRole, relationshipOption}) {
    const r = {personId, otherPersonId, otherPersonRole, relationshipOption};

    const response = await fetch(`${serverLocation}/api/people/relations`, {
        method: 'POST',
        body: JSON.stringify(r),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const resData = await response.json();
  
    if (!response.ok) {
      throw new Error('Failed to fetch places');
    }
}

export async function deleteRelationships(person1, person2) {
    const response = await fetch(`${serverLocation}/api/people/relations`, {
        method: 'DELETE',
        body: JSON.stringify({person1, person2}),
        headers: {
            'Content-Type': 'application/json',
        },
    });
  
    if (!response.ok) {
      throw new Error('Failed to fetch places');
    }
}
