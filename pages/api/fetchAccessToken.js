export const fetchAccessToken = async (code) => {
    const clientId = 'E793Gjcib6yVnNpTFD0Hr3jP-Yp6gN04yzTeXGsjlgk'; // Tu client ID
    const redirectUri = 'https://profile.tucar.dev/authenticate'; // Redirigir a esta URI

    try {
        const response = await fetch('https://account-service-twvszsnmba-uc.a.run.app/api/v1/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                grant_type: 'authorization_code',
                redirect_uri: redirectUri,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Access Token Response:', data);

            // Guarda el token
            localStorage.setItem('authToken', response.data.access_token);
            return data.access_token;
        } else {
            console.error('Error fetching access token:', response.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
    }

    
};
