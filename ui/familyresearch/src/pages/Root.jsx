import { Outlet, useLoaderData } from 'react-router-dom';

import MainNavigation from '../components/MainNavigation';

import Container from '@mui/material/Container'
import { getUser } from '../utils';
import LoginPage from './Login';
import ScrollToTop from '../components/ScrollToTop';

export default function RootLayout() {
  const user = useLoaderData();


  function logout () {
    localStorage.removeItem('user');
    return redirect('/login');
  }

  if (user) {
    return (
      <>
      <ScrollToTop />
      <Container>
        <MainNavigation user={user} />
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

export function loader() { 
  return getUser();
}
