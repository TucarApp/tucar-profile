// TODO: Remplazar por valores de secrets de un env
const ACCOUNT_APP_URL = 'https://accounts.tucar.dev/';
const MODE = 'development';
const PROFILE_APP_URL = 'https://tucar-profile-1032838122231.us-central1.run.app/authenticate';

export const getRandomState = () => {
    if (typeof window !== "undefined") { 
        const originalRandomState = localStorage.getItem('rnSt');
        if (originalRandomState) return originalRandomState;
        
        const randomState = Math.random().toString(36).substring(7); 
        localStorage.setItem('rnSt', randomState);
        return randomState;
    }
    return null; 
};

const buildRequestParams = (params) =>
    Object.keys(params)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');

const buildUri = () => {
    if (MODE !== 'development') return PROFILE_APP_URL;
    return 'https://tucar-profile-1032838122231.us-central1.run.app';
};

const baseParams = {
    client_id: 'E793Gjcib6yVnNpTFD0Hr3jP-Yp6gN04yzTeXGsjlgk',
    redirect_uri: `${buildUri()}/authenticate`,
};

const params = {
    ...baseParams,
    response_type: 'code',
    scope: 'profile',
    tenancy: MODE !== 'production' ? 'development' : 'production',
    state: getRandomState() || '', // Maneja el caso en el que getRandomState retorna null
};

export const buildAuthUri = () => {
    return `${ACCOUNT_APP_URL}/?${buildRequestParams(params)}`;
};

console.log(buildUri());


//DEEEEEVVVV

// TODO: Remplazar por valores de secrets de un env
// const ACCOUNT_APP_URL = 'https://accounts.tucar.dev/';
// const MODE = 'development';
// const PROFILE_APP_URL = 'https://profile.tucar.dev';

// export const getRandomState = () => {
//     if (typeof window !== "undefined") { // Verifica si estamos en el navegador
//         const originalRandomState = localStorage.getItem('rnSt');
//         if (originalRandomState) return originalRandomState;
        
//         const randomState = Math.random().toString(36).substring(7); // Genera un string aleatorio simple
//         localStorage.setItem('rnSt', randomState);
//         return randomState;
//     }
//     return null; // En el servidor, retorna null o un valor predeterminado
// };

// const buildRequestParams = (params) =>
//     Object.keys(params)
//       .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
//       .join('&');

// const buildUri = () => {
//     if (MODE !== 'development') return PROFILE_APP_URL;
//     return 'http://localhost:3000';
// };

// const baseParams = {
//     client_id: 'E793Gjcib6yVnNpTFD0Hr3jP-Yp6gN04yzTeXGsjlgk',
//     redirect_uri: `${buildUri()}/authenticate`,
// };

// const params = {
//     ...baseParams,
//     response_type: 'code',
//     scope: 'profile',
//     tenancy: MODE !== 'production' ? 'development' : 'production',
//     state: getRandomState() || '', // Maneja el caso en el que getRandomState retorna null
// };

// export const buildAuthUri = () => {
//     return `${ACCOUNT_APP_URL}/?${buildRequestParams(params)}`;
// };

// console.log(buildUri());