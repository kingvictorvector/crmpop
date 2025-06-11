// Re-export everything from the client index
export * from './client/index.tsx';

// Also import the default export if there is one
import DefaultExport from './client/index.tsx';
export default DefaultExport; 