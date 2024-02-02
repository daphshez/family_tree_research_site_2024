import { createBrowserRouter, RouterProvider} from 'react-router-dom';


import PeoplePage, { loader as peopleLoader, action as addPersonAction } from './pages/People.jsx';
import ProjectsPage from './pages/Projects.jsx';
import RootLayout from './pages/Root.jsx';
import PersonPage, { loader as personLoader } from './pages/Person.jsx';

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
        action: addPersonAction
      },
      { 
        path: '/people/:personId', 
        element: <PersonPage/>,
        loader: personLoader
      },
      { path: 'projects', element: <ProjectsPage /> },
    ],
  }
]);


function App() {
  return <RouterProvider router={router} />;
}

export default App
