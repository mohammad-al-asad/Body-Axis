/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useEffect, useState } from "react";
import { managementApi } from "../services/managementApi";

export const VideoContext = createContext();

export const VideoProvider = ({ children }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshVideos = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await managementApi.listVideos();
      setVideos(result.items);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshVideos();
  }, [refreshVideos]);

  const createVideo = async (payload) => {
    const created = await managementApi.createVideo(payload);
    setVideos((items) => [created, ...items]);
    return created;
  };

  const updateVideo = async (id, payload) => {
    const updated = await managementApi.updateVideo(id, payload);
    setVideos((items) => items.map((item) => (item.id === id ? updated : item)));
    return updated;
  };

  const deleteVideo = async (id) => {
    await managementApi.deleteVideo(id);
    setVideos((items) => items.filter((item) => item.id !== id));
  };

  return (
    <VideoContext.Provider
      value={{
        videos,
        loading,
        error,
        refreshVideos,
        createVideo,
        updateVideo,
        deleteVideo,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};
