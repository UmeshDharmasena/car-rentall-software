"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from 'utils/supabase/client';
import { X } from 'lucide-react';

interface Software {
  software_id: string;
  name: string;
  description: string;
}

interface ComparisonPopupProps {
  onClose: () => void;
  onAdd: (softwareName: string) => void;
  onRemove: (softwareName: string) => void;
  selectedSoftware: string[];
}

const ComparisonPopup: React.FC<ComparisonPopupProps> = ({ 
  onClose, 
  onAdd, 
  onRemove, 
  selectedSoftware 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [availableSoftware, setAvailableSoftware] = useState<Software[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComparison, setShowComparison] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    fetchAvailableSoftware();
  }, []);

  const fetchAvailableSoftware = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('Software')
        .select('software_id, name, description')
        .order('name');

      if (error) throw error;
      setAvailableSoftware(data || []);
    } catch (err) {
      console.error('Error fetching software:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOptions = availableSoftware.filter(software =>
    software.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
    !selectedSoftware.includes(software.name) && 
    selectedSoftware.length < 4
  );

  const handleSeeComparison = () => {
    if (selectedSoftware.length < 2) {
      alert('Please select at least 2 software items to compare');
      return;
    }
    setShowComparison(true);
  };

  if (showComparison) {
    // Dynamically import ComparisonScreen to avoid circular dependencies
    const ComparisonScreen = require('./ComparisonScreen').default;
    return (
      <ComparisonScreen
        selectedSoftware={selectedSoftware}
        onBack={() => setShowComparison(false)}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[500px] max-h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">View Comparison List</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Selected Software Display */}
          <div className="mb-6">
            <div className="space-y-3">
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  {selectedSoftware[index] ? (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{selectedSoftware[index]}</span>
                      <button
                        onClick={() => onRemove(selectedSoftware[index])}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-8">
                      <span className="text-3xl text-gray-300">+</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Search Section */}
          {selectedSoftware.length < 4 && (
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search software to add..."
                className="border border-gray-300 p-3 rounded-lg w-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              
              {loading ? (
                <div className="text-center py-4 text-gray-500">Loading software...</div>
              ) : searchTerm && filteredOptions.length > 0 ? (
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                  {filteredOptions.slice(0, 5).map((software) => (
                    <button
                      key={software.software_id}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                      onClick={() => {
                        onAdd(software.name);
                        setSearchTerm('');
                      }}
                    >
                      <div className="font-medium">{software.name}</div>
                      <div className="text-sm text-gray-500 truncate">{software.description}</div>
                    </button>
                  ))}
                </div>
              ) : searchTerm && filteredOptions.length === 0 ? (
                <p className="text-gray-500 text-center py-2">No matching software found.</p>
              ) : null}
            </div>
          )}

          {selectedSoftware.length === 4 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
              Maximum 4 software items can be compared at once.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <button
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              selectedSoftware.length >= 2
                ? 'bg-black text-white hover:bg-gray-800'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handleSeeComparison}
            disabled={selectedSoftware.length < 2}
          >
            SEE COMPARISON
          </button>
          {selectedSoftware.length < 2 && (
            <p className="text-xs text-gray-500 text-center mt-2">
              Select at least 2 software items to compare
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComparisonPopup;