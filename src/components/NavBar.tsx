// NavBar.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppStore } from '../store';

interface NavBarProps {
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
}

const NavBar: React.FC<NavBarProps> = ({ globalFilter, setGlobalFilter }) => {
  const navigate = useNavigate();
  const selectedRowsCount = useAppStore((state) => state.selectedRowsCount);

  const handleAddNewForm = () => {
    navigate('/form/create');
  };

  return (
    <nav className="fixed inset-x-0 top-0 w-full border-b border-gray-200 bg-white dark:bg-gray-900">
      <div
        className="flex items-center justify-between p-4"
        style={{
          maxWidth: '768px',
          width: '100%',
          margin: 'auto',
          justifyContent: 'space-between',
        }}
      >
        <a
          href="http://localhost:5173/"
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <span className="self-center whitespace-nowrap text-2xl font-semibold dark:text-white">
            Anamnesis Form
          </span>
        </a>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search forms..."
            className="rounded border p-2"
          />
          <button
            onClick={handleAddNewForm}
            type="button"
            className="rounded bg-green-500 p-2 text-white hover:bg-green-600"
          >
            Add New Form
          </button>
        </div>
      </div>
      <h4>Selected Rows: {selectedRowsCount}</h4>
    </nav>
  );
};

export default NavBar;
