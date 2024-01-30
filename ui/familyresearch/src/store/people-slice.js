import { createSlice } from '@reduxjs/toolkit';
import { listPeople, getPerson } from '../backend';


function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}


function mergeDeep(target, source) {
  for (const key in source) {
    if (isObject(source[key])) {
      if (!target[key]) target[key] = {};
      mergeDeep(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }

  return target;
}


const peopleSlice = createSlice({
    name: 'people',
    initialState: {
        people: listPeople(),   // todo: this can't really happen here 
        selectedPerson: null,
        showSelected: false,
        editingField: null,

        personToSend: null,
    },
    reducers: {
      select(state, action) {
        state.showSelected = true;
        state.selectedPerson = getPerson(action.payload.personId);
      },
      
      hideSelected(state) {
        state.showSelected = false;
      },

      newPerson(state, action){
          state.selectedPerson = action.payload.newPerson;
          state.showSelected = true;
          state.refreshPeopleList = true;
          state.people = listPeople()   // todo: this can't happen here 
      },

      editField(state, action) {
        state.editingField = {
          name: action.payload.fieldName,
          value: action.payload.fieldValue
        }
      },
      cancelEditField(state) {
        state.editingField = null;
      },
      saveFieldEdits(state, action) {
        const merged = mergeDeep({...state.selectedPerson}, action.payload);
        state.selectedPerson = merged; 
        state.editingField = null;
        state.personToSend = merged;
      },
      editError(state, action) {
        state.editingField.error = action.payload.error;
      },

      updateSentToBE(state) {
        state.personToSend = null;
      }
     
    },
  });
  
  export const peopleActions = peopleSlice.actions;

  export default peopleSlice.reducer;