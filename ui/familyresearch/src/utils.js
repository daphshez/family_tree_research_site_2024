function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}
  
  
export function mergeDeep(origin, update) {
  function internal(target, source) {
    if (isObject(target) && isObject(source)) {
      for (const key in source) {
        if (isObject(source[key])) {
          let keyTarget = isObject(target[key])? target[key] : {};
          target[key] = mergeDeep(target[key] || {}, source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }
  }


  let target = {...origin};
  internal(target, update);
  return target;
}


export function nicerDate(isoString) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Europe/London',
  }).format(Date.parse(isoString)).replace("," , "");
}


export function getUser() {
  const user = JSON.parse( localStorage.getItem('user'));

  if (!user) {
    return null;
  }

  return user;
}

export function saveUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

export function getAuthToken() {
  const user = getUser();
  return user ? user.token : null;
}

export function removeUser() { 
  localStorage.removeItem('user');
}

export function getCurrentProjectId() {
  const project = JSON.parse( localStorage.getItem('project'));
  if (project == null) {
    return "";
  }
  return project.projectId;
}

export function setCurrentProjectId(projectId) {
  localStorage.setItem('project', JSON.stringify({projectId}));
}

