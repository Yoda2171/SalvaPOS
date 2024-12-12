export const environment = {
  production: false,
  //apiUrl: 'http://localhost:3000',
  apiUrl: process.env['NG_APP_API_URL'], // URL de la API para desarrollo

  apiUrlFront: process.env['NG_APP_FRONT_URL'], // URL de la API para desarrollo
};
