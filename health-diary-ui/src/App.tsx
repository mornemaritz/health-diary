import type React from 'react'
import Home from './layout/components/Home'
import { useState, useEffect } from 'react';
import { solidAuth } from './services/solid-auth.service';
import Login from './pages/components/Login';

const App: React.FC = () => {
  const [loggedIn , setLoggedIn] = useState(false);

   useEffect(() => {
    async function init() {
      const session = await solidAuth.handleRedirect();
      setLoggedIn(session.info.isLoggedIn);
    }
    init();
  }, []);

  return (
    <>
      {loggedIn ?   <Home /> : <Login />}
    </>
  );

};

export default App;
