import { createSlice } from '@reduxjs/toolkit';
import { mergeDeep } from '../utils'




const peopleSlice = createSlice({
    name: 'people',
    initialState: {
        showSelected: false,
        editingField: null,
        personToSend: null,
    },
    reducers: {
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