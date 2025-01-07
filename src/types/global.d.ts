interface Window {
  ENV?: {
    API_URL: string;
    // Add other environment variables as needed
  };
}

// Extend the existing Window interface
declare global {
  interface Window {
    ENV?: {
      API_URL: string;
      // Add other environment variables as needed
    };
  }
}
