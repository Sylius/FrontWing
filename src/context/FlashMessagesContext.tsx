import React, { createContext, useCallback, useContext } from "react";
import { toast } from "sonner";

type FlashMessageType = "success" | "error" | "info" | "warning";

type FlashMessagesContextType = {
  addMessage: (type: FlashMessageType, content: string) => void;
};

const FlashMessagesContext = createContext<FlashMessagesContextType | undefined>(undefined);

export const FlashMessagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const addMessage = useCallback((type: FlashMessageType, content: string) => {
    toast[type](content);
  }, []);

  return (
    <FlashMessagesContext.Provider value={{ addMessage }}>{children}</FlashMessagesContext.Provider>
  );
};

export const useFlashMessages = (): FlashMessagesContextType => {
  const context = useContext(FlashMessagesContext);
  if (!context) {
    throw new Error("useFlashMessages must be used within a FlashMessagesProvider");
  }
  return context;
};
