import { Outlet, useLoaderData } from 'react-router-dom';

import MainNavigation from '../components/MainNavigation';

import Container from '@mui/material/Container'
import { getUser } from '../utils';
import { listProjects, createNewProject } from "../backend";
import LoginPage from './Login';
import ScrollToTop from '../components/ScrollToTop';

export default function RootLayout() {
  const {user, projects} = useLoaderData();


  function logout () {
    localStorage.removeItem('user');
    return redirect('/login');
  }

  if (user) {
    return (
      <>
      <ScrollToTop />
      <Container>
          <MainNavigation user={user} projects={projects} />
          <main>
            <Container sx={{marginTop: '20px'}}>
            <Outlet />
            </Container>
          </main>
      </Container>
      </>
    );
  } else {
    return <LoginPage/>
  }

}

export async function loader() { 
  const user = getUser();
  const projects = await listProjects();
  return {user, projects};
}
