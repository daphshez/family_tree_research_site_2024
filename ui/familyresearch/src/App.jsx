import { createBrowserRouter, RouterProvider} from 'react-router-dom';


import PeoplePage, { loader as peopleLoader, action as addPersonAction } from './pages/People.jsx';
import ProjectsPage , {loader as projectsLoader, action as addProjectAction } from './pages/Projects.jsx';
import RootLayout, {loader as userLoader } from './pages/Root.jsx';
import PersonPage, { loader as personLoader } from './pages/Person.jsx';
import ProjectPage, { loader as projectNotesLoader } from './pages/Project.jsx';
import NotePage, { loader as noteLoader, action as noteAction} from './pages/Note.jsx';
import LoginPage from "./pages/Login.jsx";
import { action as loginAction} from './components/LoginForm.jsx';
import TasksPage, {loader as tasksLoader, action as tasksAction } from './pages/Tasks.jsx';  
import TreePage, {loader as treeLoader} from './pages/Tree.jsx';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    loader: userLoader,
    action: loginAction,
    id: "root",
    // errorElement: <ErrorPage />,
    children: [
      { 
        index: true, 
        element: <PeoplePage /> ,
        loader: peopleLoader,
        action: addPersonAction,
        id: 'people'
      },
      { 
        path: '/people/:personId', 
        element: <PersonPage/>,
        loader: personLoader
      },
      { 
        path: 'projects', 
        loader: projectsLoader,
        action: addProjectAction,
        element: <ProjectsPage /> 
      },
      {
        path: '/projects/:projectId',
        element: <ProjectPage/>,
        loader: projectNotesLoader,
      },
      {
        path: '/projects/:projectId/notes/:noteId',
        element: <NotePage/>,
        loader: noteLoader ,
        action: noteAction
      },
      {
        path: '/projects/:projectId/createNote',
        element: <NotePage/>,
        action: noteAction
      },
      {
        path: '/projects/:projectId/tasks',
        element: <TasksPage/>,
        loader: tasksLoader,
        action: tasksAction
      }
    ],
    
  },
  {
    path: 'login',
    element: <LoginPage />,
    action: loginAction,
  },
  {
    path: 'tree',
    element: <TreePage />,
    loader: treeLoader,
  },
]);


function App() {
  return <RouterProvider router={router} />;
}

export default App
