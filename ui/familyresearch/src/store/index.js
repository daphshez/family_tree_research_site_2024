import { configureStore } from '@reduxjs/toolkit';

import peopleReducer from './people-slice';


const store = configureStore({
  reducer: { people: peopleReducer },
});

export default store;