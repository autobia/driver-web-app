import { Middleware, UnknownAction } from "@reduxjs/toolkit";

// Logger middleware to log state changes
const loggerMiddleware: Middleware = (store) => (next) => (action) => {
  const typedAction = action as UnknownAction;
  console.group(`🚀 Action: ${typedAction.type}`);

  // Log the action
  console.log("Action:", typedAction);

  // Log the current state before action
  console.log("Previous State:", store.getState());

  // Call the next middlewareå in the chain
  const result = next(action);

  // Log the state after action
  console.log("Next State:", store.getState());

  console.groupEnd();

  return result;
};

// Export all middlewares as an array
export const middlewares = [loggerMiddleware];

export default middlewares;
