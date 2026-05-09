import React from 'react';
import { Outlet } from 'react-router-dom';
import PageTransition from './PageTransition';

const MainLayout = () => {
  return (
    <PageTransition>
      <Outlet />
    </PageTransition>
  );
};

export default MainLayout;
