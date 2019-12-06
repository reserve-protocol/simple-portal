import React from 'react';
import MyComponent from './MyComponent';
import { DrizzleContext } from "drizzle-react";


import "./App.css";

export const App = () => (
  <DrizzleContext.Consumer>
    {drizzleContext => {
      const { drizzle, 
              drizzleState, 
              initialized } = drizzleContext;
      
      return <MyComponent 
         drizzle={drizzle} 
         drizzleState={drizzleState}
         initialized={initialized} />
  }}
  </DrizzleContext.Consumer>
)
export default App;
