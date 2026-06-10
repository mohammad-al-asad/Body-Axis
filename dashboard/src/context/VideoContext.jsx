import React, { createContext, useState } from 'react';

const generateVideos = (count) => {
  const names = [
    'Supine Pelvic Clocks', 'Thoracic Extension', 'Long-Lever Hamstring Bridge',
    'Dead Bug', 'Bird Dog', 'McGill Curl-Up', 'B-Stance Glute Bridge',
    'Romanian Deadlift', 'Bulgarian Split Squat', 'Front Rack Carry'
  ];
  
  return Array.from({ length: count }, (_, i) => {
    let status;
    if (i % 4 === 0) status = 'Error';
    else if (i % 3 === 0) status = 'Processing';
    else status = 'Uploaded';

    return {
      id: `EX-26${(i + 1).toString().padStart(4, '0')}`,
      name: names[i % names.length],
      fileSize: '248.5 MB',
      uploadDate: '10/30/2025',
      status: status
    };
  });
};

export const VideoContext = createContext();

export const VideoProvider = ({ children }) => {
  const [videos, setVideos] = useState(generateVideos(30));

  const addVideo = (newVideo) => {
    const today = new Date().toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
    
    setVideos([
      {
        id: `EX-26${(videos.length + 1).toString().padStart(4, '0')}`,
        name: newVideo.name,
        fileSize: '0.0 MB',
        uploadDate: today,
        status: 'Processing',
        ...newVideo
      },
      ...videos
    ]);
  };

  const deleteVideo = (id) => {
    setVideos(videos.filter(v => v.id !== id));
  };

  return (
    <VideoContext.Provider value={{ videos, addVideo, deleteVideo }}>
      {children}
    </VideoContext.Provider>
  );
};
