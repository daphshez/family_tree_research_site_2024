import { Outlet } from 'react-router-dom';

import MainNavigation from '../components/MainNavigation';

import Container from '@mui/material/Container'

export default function RootLayout() {
  return (
    <Container>
      <MainNavigation />
      <main>
        <Outlet />
      </main>
    </Container>
  );
}
