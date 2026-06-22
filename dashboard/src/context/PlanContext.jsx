/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useEffect, useState } from "react";
import { managementApi } from "../services/managementApi";

export const PlanContext = createContext();

export const PlanProvider = ({ children }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshPlans = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await managementApi.listPlans();
      setPlans(result.items);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshPlans();
  }, [refreshPlans]);

  const createPlan = async (payload) => {
    const created = await managementApi.createPlan(payload);
    setPlans((items) => [created, ...items]);
    return created;
  };

  const updatePlan = async (id, payload) => {
    const updated = await managementApi.updatePlan(id, payload);
    setPlans((items) =>
      items.map((item) => (item.plan_id === id ? updated : item)),
    );
    return updated;
  };

  const deletePlan = async (id) => {
    await managementApi.deletePlan(id);
    setPlans((items) => items.filter((item) => item.plan_id !== id));
  };

  return (
    <PlanContext.Provider
      value={{
        plans,
        loading,
        error,
        createPlan,
        updatePlan,
        deletePlan,
        refreshPlans,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
};
