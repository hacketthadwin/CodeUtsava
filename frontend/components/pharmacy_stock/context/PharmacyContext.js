import React, { createContext, useState, useContext } from 'react';
import { initialMockData } from '../data/mockData';

const PharmacyContext = createContext();

export const usePharmacy = () => {
  const context = useContext(PharmacyContext);
  if (!context) {
    throw new Error('usePharmacy must be used within PharmacyProvider');
  }
  return context;
};

export const PharmacyProvider = ({ children }) => {
  const [medicines, setMedicines] = useState(initialMockData);

  const addMedicine = (medicine) => {
    const newMedicine = {
      ...medicine,
      id: Date.now().toString(),
    };
    setMedicines([...medicines, newMedicine]);
  };

  const updateMedicine = (id, updatedMedicine) => {
    setMedicines(medicines.map(med => 
      med.id === id ? { ...med, ...updatedMedicine } : med
    ));
  };

  const deleteMedicine = (id) => {
    setMedicines(medicines.filter(med => med.id !== id));
  };

  const importMedicines = (newMedicines) => {
    const medicinesWithIds = newMedicines.map((med, index) => ({
      ...med,
      id: med.id || `imported-${Date.now()}-${index}`,
    }));
    setMedicines([...medicines, ...medicinesWithIds]);
  };

  const value = {
    medicines,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    importMedicines,
  };

  return (
    <PharmacyContext.Provider value={value}>
      {children}
    </PharmacyContext.Provider>
  );
};
