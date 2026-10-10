import React, { useState } from 'react';
import { Tag, AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, color: string) => void;
}

const colorOptions = [
  { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
  { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
  { name: 'Cyan', value: 'cyan', class: 'bg-cyan-500' },
  { name: 'Emerald', value: 'emerald', class: 'bg-emerald-500' },
  { name: 'Amber', value: 'amber', class: 'bg-amber-500' },
  { name: 'Red', value: 'red', class: 'bg-red-500' },
];

export default function CategoryModal({ isOpen, onClose, onSave }: CategoryModalProps) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('purple');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }
    onSave(name.trim(), selectedColor);
    setName('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New Note Category"
      subtitle="Organize your study notes by subject or topic"
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
            <Tag size={13} className="text-purple-400" /> Category Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Distributed Systems, LeetCode Hard"
            value={name}
            onChange={e => {
              setName(e.target.value);
              if (error) setError('');
            }}
            className={`w-full bg-dark-800 border ${
              error ? 'border-red-500' : 'border-dark-500 focus:border-purple-500/60'
            } rounded-xl px-3.5 py-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none transition-colors`}
          />
          {error && (
            <p className="flex items-center gap-1 text-xs text-red-400 mt-1">
              <AlertCircle size={12} /> {error}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-2">
            Badge Accent Color
          </label>
          <div className="flex gap-2.5">
            {colorOptions.map(c => (
              <button
                type="button"
                key={c.value}
                onClick={() => setSelectedColor(c.value)}
                className={`w-8 h-8 rounded-xl ${c.class} transition-all ${
                  selectedColor === c.value
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-800 scale-110'
                    : 'opacity-70 hover:opacity-100'
                }`}
                title={c.name}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-dark-600/50">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Create Category</Button>
        </div>
      </form>
    </Modal>
  );
}
