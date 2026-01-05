import React, { useState, useEffect } from 'react';

interface WifiGuardProps {
  requiredSSID: string;
  onValidationChange: (isValid: boolean, currentSSID: string) => void;
}

const WifiGuard: React.FC<WifiGuardProps> = ({ requiredSSID, onValidationChange }) => {
  const [currentSSID, setCurrentSSID] = useState<string>('Unknown Network');
  
  // NOTE: Browsers cannot access real SSID due to security sandboxing.
  // In a real PWA/Native app, we would use the Network Information API or a plugin.
  // For this B.Tech Project demo, we simulate it with a selector.
  
  const handleNetworkSimulation = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCurrentSSID(val);
    onValidationChange(val === requiredSSID, val);
  };

  useEffect(() => {
    // Initial check
    onValidationChange(currentSSID === requiredSSID, currentSSID);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSSID, requiredSSID]);

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <p className="font-bold text-yellow-800">Wi-Fi Restriction Active</p>
          <p className="text-sm text-yellow-700">
            You must be connected to: <span className="font-mono bg-yellow-200 px-1 rounded">{requiredSSID}</span>
          </p>
        </div>
        
        <div className="mt-2 sm:mt-0">
          <label className="block text-xs font-semibold text-yellow-800 mb-1">
            Simulate Connection (Demo Only)
          </label>
          <select 
            value={currentSSID} 
            onChange={handleNetworkSimulation}
            className="text-sm border-yellow-300 rounded p-1 bg-white"
          >
            <option value="Unknown Network">Mobile Data / Home Wi-Fi</option>
            <option value={requiredSSID}>{requiredSSID} (Classroom)</option>
            <option value="Starbucks WiFi">Other Public Wi-Fi</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default WifiGuard;