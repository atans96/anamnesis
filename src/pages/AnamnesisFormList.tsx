import type { ColumnDef } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  deleteAnamnesisForm,
  fetchAnamnesisFormList,
} from '../services/anamnesisService';
import type { AnamnesisForm } from '../types/anamnesis';

function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (timeout !== null) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-gray-800">
          Confirm Deletion
        </h2>
        <p className="mb-6 text-gray-600">
          Are you sure you want to delete this form?
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            type="button"
            className="rounded bg-gray-200 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            type="button"
            className="rounded bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const ActionButtons: React.FC<{
  row: any;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
}> = ({ row, onDelete, onEdit, onView }) => (
  <div>
    <button
      type="button"
      onClick={() => onView(row.original.id)}
      className="mr-2 text-blue-500"
    >
      View
    </button>
    <button
      type="button"
      onClick={() => onEdit(row.original.id)}
      className="mr-2 text-green-500"
    >
      Edit
    </button>
    <button
      type="button"
      onClick={() => onDelete(row.original.id)}
      className="text-red-500"
    >
      Delete
    </button>
  </div>
);

const AnamnesisFormList: React.FC = () => {
  const [forms, setForms] = useState<AnamnesisForm[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleDeleteClick = (id: string) => {
    setFormToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (formToDelete) {
      await deleteAnamnesisForm(formToDelete);
      setForms(forms.filter((form) => form.id !== formToDelete));
    }
    setIsDeleteModalOpen(false);
    setFormToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setFormToDelete(null);
  };

  const columns: ColumnDef<AnamnesisForm>[] = [
    {
      header: 'Title',
      accessorKey: 'title',
    },
    {
      header: 'Description',
      accessorKey: 'description',
    },
    {
      header: 'Created At',
      accessorKey: 'createdAt',
    },
    {
      header: 'Actions',
      // eslint-disable-next-line
      cell: ({ row }) => (
        <ActionButtons
          row={row}
          onDelete={() => handleDeleteClick(row.original.id)}
          onEdit={() => navigate(`/form/edit/${row.original.id}`)}
          onView={() => navigate(`/form/${row.original.id}`)}
        />
      ),
    },
  ];

  const table = useReactTable({
    data: forms,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: {
        pageSize: 1, // Set the number of items per page to 10
      },
    },
  });

  const debouncedSearch = useCallback(
    debounce((term: string) => {
      fetchAnamnesisFormList(term).then(setForms);
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(globalFilter);
  }, [globalFilter, debouncedSearch]);

  const handleAddNewForm = () => {
    navigate('/form/create');
  };

  return (
    <div className="container mx-auto p-4">
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
      <h1 className="mb-4 text-2xl font-bold">Anamnesis Forms</h1>
      <input
        type="text"
        value={globalFilter ?? ''}
        onChange={(e) => setGlobalFilter(e.target.value)}
        placeholder="Search forms..."
        className="mb-4 rounded border p-2"
      />
      <button
        onClick={handleAddNewForm}
        type="button"
        className="rounded bg-green-500 p-2 text-white hover:bg-green-600"
      >
        Add New Form
      </button>
      <table className="w-full border-collapse">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="border p-2">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="border p-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
          type="button"
          className="rounded bg-blue-500 p-2 text-white disabled:bg-gray-300"
        >
          {'<<'}
        </button>
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          type="button"
          className="rounded bg-blue-500 p-2 text-white disabled:bg-gray-300"
        >
          {'<'}
        </button>
        <span>
          Page{' '}
          <strong>
            {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </strong>{' '}
          | Go to page:
          <input
            type="number"
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              table.setPageIndex(page);
            }}
            className="ml-2 w-16 rounded border p-1"
          />
        </span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          type="button"
          className="rounded bg-blue-500 p-2 text-white disabled:bg-gray-300"
        >
          {'>'}
        </button>
        <button
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
          type="button"
          className="rounded bg-blue-500 p-2 text-white disabled:bg-gray-300"
        >
          {'>>'}
        </button>
      </div>
      <div className="mt-2">
        Showing {table.getRowModel().rows.length} of {forms.length} results
      </div>
    </div>
  );
};

export default AnamnesisFormList;
