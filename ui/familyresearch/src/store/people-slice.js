import { createSlice } from '@reduxjs/toolkit';
import { listPeople, getPerson } from '../backend';


const peopleSlice = createSlice({
    name: 'people',
    initialState: {
        people: listPeople(),
        selectedPerson: null,
        showSelected: false,
        editingField: null
    },
    reducers: {
      select(state, action) {
        state.showSelected = true;
        state.selectedPerson = getPerson(action.payload.personId);
      },
      hideSelected(state) {
        state.showSelected = false;
      },
      editField(state, action) {
        state.editingField = {
          name: action.payload.fieldName,
          value: action.payload.fieldValue
        }
      },

      cancelEditField(state, action) {
        state.editingField = null;
      },
      saveFieldEdits(state) {
        state.selectedPerson = getPerson(state.selectedPerson.personId);
        state.editingField = null;
      }
     
    },
  });
  
  export const peopleActions = peopleSlice.actions;

  export default peopleSlice.reducer;