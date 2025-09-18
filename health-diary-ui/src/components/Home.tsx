import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <>
      <header>
        <h4>Health Diary</h4>
      </header>
      <main>
        <h3>Welcome to the Health Diary</h3>
        <p>Track health events and actions.</p>
        <Link to="/add-action" className="btn btn-primary">Add Action</Link>
      </main>
    </>
  );
};

export default Home;