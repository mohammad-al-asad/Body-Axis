import React, { createContext, useState } from 'react';

// Generate dynamic dataset for pagination demo
const generateMockProtocols = (count) => {
  // exact data for the first 8 items matching the screenshot
  const screenshotData = [
    { name: "The Rotator Cuff Reset", duration: "15m", active: true },
    { name: "The Lower Back Performance Flow", duration: "30m", active: true },
    { name: "The Lower Back Deep Performance", duration: "45m", active: true },
    { name: "The Rotator Cuff Reset", duration: "60m", active: false },
    { name: "The Hip Rotation Deep Performance", duration: "45m", active: true },
    { name: "The Hip Flexor Strength Full Build", duration: "30m", active: false },
    { name: "The Upper Back Ache Full Protocol", duration: "30m", active: false },
    { name: "The Shoulder ER Reset", duration: "15m", active: true }
  ];

  const poolNames = [
    "The Knee Stabilization Drill",
    "The Core Alignment Flow",
    "The Ankle Mobility Sequence",
    "The Thoracic Spine Opener",
    "The Posterior Chain Activator",
    "The Hip Rotation Deep Performance",
    "The Rotator Cuff Reset",
    "The Lower Back Performance Flow"
  ];
  const poolDurations = ["15m", "30m", "45m", "60m"];

  return Array.from({ length: count }, (_, i) => {
    const id = String(i + 1).padStart(3, '0');
    if (i < 8) {
      return {
        id,
        ...screenshotData[i]
      };
    } else {
      return {
        id,
        name: poolNames[i % poolNames.length],
        duration: poolDurations[i % poolDurations.length],
        active: i % 3 !== 0
      };
    }
  });
};

export const ProtocolContext = createContext();

export const ProtocolProvider = ({ children }) => {
  const [protocols, setProtocols] = useState(generateMockProtocols(124));

  const addProtocol = (newProtocol) => {
    setProtocols([
      {
        id: String(protocols.length + 1).padStart(3, '0'),
        ...newProtocol,
        active: true
      },
      ...protocols
    ]);
  };

  const toggleStatus = (id) => {
    setProtocols(protocols.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  return (
    <ProtocolContext.Provider value={{ protocols, addProtocol, toggleStatus }}>
      {children}
    </ProtocolContext.Provider>
  );
};
