/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useEffect, useState } from "react";
import { managementApi } from "../services/managementApi";

export const ExerciseContext = createContext();

export const ExerciseProvider = ({ children }) => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshExercises = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await managementApi.listExercises();
      setExercises(result.items);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshExercises();
  }, [refreshExercises]);

  const createExercise = async (payload) => {
    const created = await managementApi.createExercise(payload);
    setExercises((items) => [created, ...items]);
    return created;
  };

  const updateExercise = async (id, payload) => {
    const updated = await managementApi.updateExercise(id, payload);
    setExercises((items) =>
      items.map((item) => (item.exercise_id === id ? updated : item)),
    );
    return updated;
  };

  const deleteExercise = async (id) => {
    await managementApi.deleteExercise(id);
    setExercises((items) => items.filter((item) => item.exercise_id !== id));
  };

  return (
    <ExerciseContext.Provider
      value={{
        exercises,
        loading,
        error,
        refreshExercises,
        createExercise,
        updateExercise,
        deleteExercise,
      }}
    >
      {children}
    </ExerciseContext.Provider>
  );
};
