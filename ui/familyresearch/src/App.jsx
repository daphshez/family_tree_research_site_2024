import { createBrowserRouter, RouterProvider} from 'react-router-dom';


import PeoplePage, { loader as peopleLoader, action as addPersonAction } from './pages/People.jsx';
import ProjectsPage , {loader as projectsLoader, action as addProjectAction } from './pages/Projects.jsx';
import RootLayout from './pages/Root.jsx';
import PersonPage, { loader as personLoader } from './pages/Person.jsx';
import ProjectPage, { loader as projectNotesLoader } from './pages/Project.jsx';
import NotePage, { loader as noteLoader, action as noteAction} from './pages/Note.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
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
      }
    
    ],
  }
]);


function App() {
  return <RouterProvider router={router} />;
}

export default App
