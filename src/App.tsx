import './App.css';

import { BrowserRouter, Route, Routes } from 'react-router-dom';

import AnamnesisFormEditor from './components/AnamnesisFormEditor';
import CreateAnamnesisForm from './components/CreateAnamnesisForm';
import AnamnesisFormDetail from './pages/AnamnesisFormDetail';
import AnamnesisFormList from './pages/AnamnesisFormList';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div>
        <Routes>
          <Route path="/" element={<AnamnesisFormList />} />
          <Route path="/form/create" element={<CreateAnamnesisForm />} />
          <Route path="/form/:id" element={<AnamnesisFormDetail />} />
          <Route path="/form/edit/:id" element={<AnamnesisFormEditor />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
