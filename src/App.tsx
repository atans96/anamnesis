// App.tsx
import './App.css';

import React, { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import AnamnesisFormEditor from './components/AnamnesisFormEditor';
import CreateAnamnesisForm from './components/CreateAnamnesisForm';
import NavBar from './components/NavBar';
import AnamnesisFormDetail from './pages/AnamnesisFormDetail';
import AnamnesisFormList from './pages/AnamnesisFormList';

const App: React.FC = () => {
  const [globalFilter, setGlobalFilter] = useState('');

  return (
    <BrowserRouter>
      <div>
        <NavBar globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
        <Routes>
          <Route
            path="/"
            element={
              <AnamnesisFormList
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
              />
            }
          />
          <Route path="/form/create" element={<CreateAnamnesisForm />} />
          <Route path="/form/:id" element={<AnamnesisFormDetail />} />
          <Route path="/form/edit/:id" element={<AnamnesisFormEditor />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
