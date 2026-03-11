const config = {
  isProduction: import.meta.env.PROD,
  contentfulSpaceId: import.meta.env.VITE_CONTENTFUL_SPACE_ID,
  contentfulAccessToken: import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN,
  // Dev default when no .env: socket at 7777. Set VITE_SOCKET_URI to override.
  socketURI:
    import.meta.env.VITE_SOCKET_URI ||
    (import.meta.env.PROD
      ? import.meta.env.VITE_SERVER_URI
      : 'http://localhost:7777'),
  apiBaseUrl:
    import.meta.env.PROD
      ? import.meta.env.VITE_SERVER_URI
      : '',
};

export default config;
