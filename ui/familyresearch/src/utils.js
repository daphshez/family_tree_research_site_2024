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
    }).format(Date.parse(isoString));
  }


  