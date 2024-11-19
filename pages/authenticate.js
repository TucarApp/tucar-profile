import { useState, useEffect } from 'react';
import { PencilIcon, XIcon, MenuIcon, CheckCircleIcon, ExclamationCircleIcon, ChevronRightIcon } from '@heroicons/react/solid';
import TucarLogo from '../components/LogoTucar/LogoTucar';
import AuthButton from '@/components/Auth/AuthButton';
import InputField from '@/components/Auth/InputField';


import { fetchUserData } from '../utils/mocks/mockUsersApi';
import { updateCredentials } from '../utils/mocks/mockCredentialsApi';
import { verifyUser } from '../utils/mocks/mockVerifyApi';
import { changePassword } from '../utils/mocks/mockChangePasswordApi';
import { confirmChangePassword } from '../utils/mocks/mockConfirmChangePasswordApi';
import { useRouter } from 'next/router';

import { buildAuthUri } from '@/helpers/buildUri';

import { useSearchParams } from 'next/navigation';


const Cuenta = () => {
    const [selectedSection, setSelectedSection] = useState('Account Info');
    const router = useRouter();

    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [isChangeConfirmed, setIsChangeConfirmed] = useState(false);

    const [allowedApplications, setAllowedApplications] = useState([]);

    console.log(allowedApplications, 'que eees')
    const [name, setName] = useState('');
    const [lastname, setLastname] = useState('');
    const [phone, setPhone] = useState('');
    const [phoneCode, setPhoneCode] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userIdentifier, setUserIdentifier] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const [changePasswordStatus, setChangePasswordStatus] = useState(null);
    const [confirmPasswordStatus, setConfirmPasswordStatus] = useState(null);
    const [verifiedStatus, setVerifiedStatus] = useState({ email: false, phone: false });
    const [authentications, setAuthentications] = useState([]); // Nuevo estado para autenticaciones

    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingLastname, setIsEditingLastname] = useState(false);

    const [userId, setUserId] = useState(null); // Estado para almacenar el userId

    const [phoneError, setPhoneError] = useState('');
    const [emailError, setEmailError] = useState(''); // Define emailError y su setter setEmailError
    const [blockStatus, setBlockStatus] = useState(''); // Estado para almacenar el mensaje de bloqueo


    const searchParams = useSearchParams(); // Hook de next/navigation
    const [token, setToken] = useState(null); // Guardar el token recibido
    const [userData, setUserData] = useState(null); // Guardar los datos del usuario
    const [error, setError] = useState(''); // Manejo de errores

    useEffect(() => {
        const fetchTokenAndUserData = async () => {
            try {
                const code = searchParams.get('code'); // Captura el parámetro "code"
                const state = searchParams.get('state'); // Opcional: captura el parámetro "state"
    
                // Validar si el código existe
                if (!code) {
                    setError('No se encontró el código en la URL');
                    return;
                }
    
                // Paso 1: Obtener el token
                const body = new URLSearchParams({
                    code,
                    client_id: 'E793Gjcib6yVnNpTFD0Hr3jP-Yp6gN04yzTeXGsjlgk',
                    grant_type: 'authorization_code',
                    redirect_uri: 'http://localhost:3000/authenticate',
                });
    
                const tokenResponse = await fetch('https://account-service-twvszsnmba-uc.a.run.app/api/v1/oauth/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: body.toString(),
                });
    
                if (tokenResponse.ok) {
                    const tokenData = await tokenResponse.json();
                    console.log('Token recibido:', tokenData.access_token); // Consola el token
                    setToken(tokenData.access_token); // Guardar el token en el estado
    
                    // Paso 2: Obtener el userId con el token
                    const userIdResponse = await fetchUserId(tokenData.access_token);
    
                    if (userIdResponse) {
                        console.log("UserId obtenido:", userIdResponse); // Consola el userId
                        setUserId(userIdResponse); // Guardar el userId en el estado
    
                        // Paso 3: Obtener datos del usuario con el token y userId
                        await fetchUserData(tokenData.access_token);
                    }
                } else {
                    const tokenError = await tokenResponse.json();
                    console.error('Error al obtener el token:', tokenError);
                    setError(tokenError.error_description || 'Error al obtener el token');
                }
            } catch (err) {
                console.error('Error en la solicitud:', err);
                setError('Error de conexión. Inténtalo nuevamente.');
            }
        };
    
        fetchTokenAndUserData();
    }, [searchParams]);
    
    // Función para obtener el userId
    const fetchUserId = async (token) => {
        try {
            const response = await fetch(`https://account-service-twvszsnmba-uc.a.run.app/api/v1/resources/token-metadata?token=${token}`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });
    
            if (response.ok) {
                const data = await response.json();
                console.log("Token Metadata Response:", data); // Consola la respuesta para ver el userId
                return data.user_id; // Devuelve el userId
            } else {
                const errorData = await response.json();
                console.error("Error fetching token metadata:", response.status, errorData);
                return null;
            }
        } catch (error) {
            console.error("Error:", error);
            return null;
        }
    };
    
    // Función para obtener los datos del usuario
    const fetchUserData = async (token) => {
        try {
            const response = await fetch('https://account-service-1032838122231.us-central1.run.app/api/v1/users/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`, // Pasar el token como Bearer
                },
            });
    
            if (response.ok) {
                const userData = await response.json();
                console.log('Datos del usuario recibidos:', userData); // Consola los datos
                setUserData(userData); // Guardar los datos en el estado
            } else {
                const userError = await response.json();
                console.error('Error al obtener datos del usuario:', userError);
                setError(userError.detail || 'Error al obtener los datos del usuario');
            }
        } catch (err) {
            console.error("Error fetching user data:", err);
            setError('Error al obtener datos del usuario. Inténtalo nuevamente.');
        }
    };
    

    console.log(userData?.firstname, userData?.lastname)
    console.log(userData?.firstname, userData?.lastname, 'estooo')





    

    // const token = "AC.UFCZkWeUrBbOu0h2k5eiXBIA0KM6y-41o8iWbS5WlkhXoWZm6B5XQYK7v91r-_7GnLCEo8j7uQTE2kj9m2Gj47SBmHVeWZ11OkFFt_0uLAxEQzmMgLzkV5KSPBPiEhgC_TvgVjtxpLjnPP9qjMIY8EwI7g6sLdg3sq1S-A.SzqLHfbkwjsPRgT6Ej5FjMWV-1COAepHEqzuTNgtd3lOJbwIU4TdNRabYYaVAKawJhCbsKah0TUQI43c_WotAjtpdS4Yr7wLaJlsi8xub9bIjSC0UeXA8n0GX7RrwH4bTDTbQSGTkBRvaympxx58reTThZEHG9-ctPBHx0akAMzNGS47Pw0hVJSMu-4yVQDkZbhsoZU4ofcMErmOTocGkOhd4HlESmzurKYvt-4QaU5MFqFYv6ApX0bXRXneobBYuMBTjR3MjA2WxoENz4Icif2tX_Cnf6dehL4yJxB0vQ5Z4nUgiodQRpCOBwZYLe_EMScGKOb0yLXcKYuhI-cTUg"






    useEffect(() => {
        const loadData = async () => {
            const data = await fetchUserData();
            const verifyData = await verifyUser();
            setUserData(data);

            if (data) {
                setName(data.allowedApplications[0].contactName || '');
                setLastname(data.allowedApplications[0].contactLastname || '');
                setPhone(data.allowedApplications[0].contactPhone || '');
                setPhoneCode(data.code || '');
                setEmail(data.allowedApplications[0].contactEmail || '');
            }

            if (verifyData) {
                setVerifiedStatus(verifyData.verifiedElements);
            }

            // Fetch user credentials using the default email
            await fetchUserCredentials("email", "ticomiranda4@gmail.com");

            // Obtener el userId usando el token
            await fetchUserId();
        };
        loadData();
    }, []);


    // const fetchUserId = async () => {
    //     if (!token) {
    //         console.error("El token no está definido o es inválido");
    //         return;
    //     }
    //     try {
    //         const response = await fetch(`https://account-service-twvszsnmba-uc.a.run.app/api/v1/resources/token-metadata?token=${token}`, {
    //             method: 'GET',
    //             headers: {
    //                 "Content-Type": "application/json",
    //                 Authorization: `Bearer ${token}`
    //             }
    //         });
    //         if (response.ok) {
    //             const data = await response.json();
    //             console.log("Token Metadata Response:", data); // Consola la respuesta para ver el userId
    //             setUserId(data.user_id); // Almacena el userId en el estado
    //         } else {
    //             const errorData = await response.json();
    //             console.error("Error fetching token metadata:", response.status, errorData);
    //         }
    //     } catch (error) {
    //         console.error("Error:", error);
    //     }
    // };
    

    // mare

    useEffect(() => {
        if (userData) {
            setName(userData.firstname || '');
            setLastname(userData.lastname || '');
            setPhone(userData.phone || '');
            setPhoneCode(userData.code || '');
            setEmail(userData.email || '');
            setVerifiedStatus({
                email: userData.verifiedElements?.email || false,
                phone: userData.verifiedElements?.phone || false,
            });
            setAuthentications(userData.authentications || []);
            setAllowedApplications(userData.allowed_applications || []);
            
        }
    }, [userData]);

    console.log('dataaa', userData)

    // Function to fetch user credentials with token
    const fetchUserCredentials = async (credentialType, value) => {
        try {
            const response = await fetch(`https://account-service-twvszsnmba-uc.a.run.app/api/v1/users/?credential_type=${credentialType}&value=${value}`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                console.log("User Credentials Response:", data);

                // Update the states with fetched data
                setName(userData.firstname || '');
                setLastname(data.lastname || '');
                setPhone(data.phone || '');
                setPhoneCode(data.code || '');
                setEmail(data.email || '');
                setVerifiedStatus(data.verifiedElements || { email: false, phone: false });
                setAuthentications(data.authentications || []);
                setAllowedApplications(data.allowed_applications || []);
                console.error("Error fetching user credentials:", response.statusText);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };



    const handleSectionChange = (section) => {
        setSelectedSection(section);
        setIsMenuOpen(false);
    };

    const cancelEdit2 = () => {
        setIsEditingPassword(false);
        setIsCodeSent(false);
        setIsChangeConfirmed(false);
        setCurrentPassword('');
        setNewPassword('');
        setVerificationCode('');
        setChangePasswordStatus(null);
        setConfirmPasswordStatus(null);
    };


    const handleEditPassword = () => {
        setIsEditingPassword(true);
        setIsCodeSent(false);
        setChangePasswordStatus(null);
    };

    const cancelEdit = (field) => {
        if (field === 'name') setIsEditingName(false);
        if (field === 'phone') setIsEditingPhone(false);
        if (field === 'email') setIsEditingEmail(false);
        if (field === 'password') setIsEditingPassword(false);
        setVerificationCode('');
    };



    const handleChangePassword = async () => {
        const response = await changePassword({
            password,
            userIdentifier
        });
        if (response.status === "success") {
            setIsCodeSent(true);
            setChangePasswordStatus("Código de verificación enviado. Revisa tu correo o teléfono.");
        } else {
            setChangePasswordStatus("Error al enviar el código. Inténtalo de nuevo.");
        }
    };

    const handleConfirmChangePassword = async () => {
        const response = await confirmChangePassword({
            code: verificationCode,
            userIdentifier
        });
        if (response.status === "success") {
            setConfirmPasswordStatus("Contraseña cambiada con éxito.");
        } else {
            setConfirmPasswordStatus("Error al confirmar el cambio de contraseña. Inténtalo de nuevo.");
        }
    };

    // Función para actualizar el nombre o apellido
    const updateUserCredential = async (type, value) => {
        try {
            const response = await fetch(`https://account-service-twvszsnmba-uc.a.run.app/api/v1/users/credentials`, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    credential: {
                        type: type,
                        value: value
                    },
                    userId: userId
                })
            });
            if (response.ok) {
                console.log(`${type} actualizado correctamente`);
                // Aquí puedes actualizar el estado local si es necesario, por ejemplo:
                if (type === "firstname") {
                    setIsEditingName(false);
                } else if (type === "lastname") {
                    setIsEditingLastname(false);
                }
            } else {
                console.error("Error al actualizar el credential:", response.statusText);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };



    const handleSendVerificationCode = async () => {
        try {
            const response = await fetch(`https://account-service-twvszsnmba-uc.a.run.app/api/v1/users/credentials`, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    credential: {
                        type: "phone",
                        value: phone
                    },
                    userId: userId
                })
            });

            if (response.ok) {
                console.log("Número de teléfono actualizado correctamente.");
                setIsCodeSent(true);
                setPhoneError(''); // Limpiar error previo
                setChangePasswordStatus("Código de verificación enviado. Revisa tu teléfono.");
            } else {
                const errorData = await response.json();
                console.log("Error Data:", errorData); // Verificar la estructura de errorData

                if (errorData.detail && errorData.detail.errors === "Phone already in use") {
                    setPhoneError("Número de teléfono ya está en uso.");
                } else {
                    setPhoneError(errorData.detail?.message || "Error al enviar el código de verificación");
                }
                console.error("Error al actualizar el número de teléfono:", errorData);
            }
        } catch (error) {
            setPhoneError("Error de conexión. Inténtalo nuevamente.");
            console.error("Error:", error);
        }
    };


    const handleConfirmVerificationCode = async () => {
        try {
            const response = await fetch(`https://account-service-twvszsnmba-uc.a.run.app/api/v1/users/verify`, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    credential: {
                        type: "phone",
                        value: verificationCode
                    },
                    userId: userId,

                })
            });
            if (response.ok) {
                console.log("Número de teléfono verificado correctamente");
                setVerifiedStatus((prevStatus) => ({ ...prevStatus, phone: true }));
                setIsEditingPhone(false);
                setIsCodeSent(false);
            } else {
                console.error("Error al verificar el número de teléfono:", response.statusText);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleSendVerificationCodeForEmail = async () => {
        try {
            const response = await fetch(`https://account-service-twvszsnmba-uc.a.run.app/api/v1/users/credentials`, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    credential: {
                        type: "email",
                        value: email
                    },
                    userId: userId
                })
            });

            if (response.ok) {
                console.log("Correo electrónico actualizado correctamente.");
                setIsCodeSent(true);
                setEmailError(''); // Limpiar error previo
                setChangePasswordStatus("Código de verificación enviado. Revisa tu correo electrónico.");
            } else {
                const errorData = await response.json();
                console.log("Error Data:", errorData); // Verificar la estructura de errorData

                if (errorData.detail && errorData.detail.errors === "Email already in use") {
                    setEmailError("El correo electrónico ya está en uso.");
                } else if (errorData.detail && errorData.detail.errors === "Can't change your email if have a Google or Uber account linked") {
                    setEmailError("No se puede cambiar el correo electrónico si tienes una cuenta vinculada de Google o Uber.");
                } else {
                    setEmailError("Error al enviar el código de verificación.");
                }
                console.error("Error al actualizar el correo electrónico:", errorData);
            }
        } catch (error) {
            setEmailError("Error de conexión. Inténtalo nuevamente.");
            console.error("Error:", error);
        }
    };


    const handleConfirmVerificationCodeForEmail = async () => {
        try {
            const response = await fetch(`https://account-service-twvszsnmba-uc.a.run.app/api/v1/users/verify`, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    credential: {
                        type: "email",
                        value: verificationCode // Enviar el código de verificación
                    },
                    userId: userId
                })
            });
            if (response.ok) {
                console.log("Correo electrónico verificado correctamente");
                setVerifiedStatus((prevStatus) => ({ ...prevStatus, email: true }));
                setIsEditingEmail(false);
                setIsCodeSent(false);
            } else {
                console.error("Error al verificar el correo electrónico:", response.statusText);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleBlockAccount = async () => {
        try {
            const response = await fetch(`https://account-service-twvszsnmba-uc.a.run.app/api/v1/users/block`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: userId
                })
            });

            if (response.ok) {
                setBlockStatus("Cuenta bloqueada correctamente.");
            } else {
                const errorData = await response.json();
                setBlockStatus("Error al bloquear la cuenta: " + (errorData.detail?.errors || response.statusText));
            }
        } catch (error) {
            console.error("Error:", error);
            setBlockStatus("Error de conexión. Inténtalo nuevamente.");
        }
    };





    return (
        <div className='font-Poppins'>
            {/* Barra superior */}
            <div className="w-full bg-[#0057b8] h-16 flex items-center justify-between px-4 lg:px-6">
                <TucarLogo color="white" className="h-12" />
                <button className="text-white lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
                </button>
            </div>

            <div className="flex">
                {/* Menú lateral */}
                <div className={`fixed lg:static top-0 left-0 w-3/4 max-w-xs bg-[white] h-full z-20 transition-transform transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:w-1/6 lg:h-screen lg:block`}>
                    <ul className="text-[#333333] mt-6 lg:mt-5 p-5">
                        <li
                            className={`cursor-pointer mb-4 ${selectedSection === 'Account Info' ? 'font-bold' : ''}`}
                            onClick={() => handleSectionChange('Account Info')}
                        >
                            Información de la cuenta
                        </li>
                        <li
                            className={`cursor-pointer mb-4 ${selectedSection === 'Security' ? 'font-bold' : ''}`}
                            onClick={() => handleSectionChange('Security')}
                        >
                            Seguridad
                        </li>
                        <li
                            className={`cursor-pointer mb-4 ${selectedSection === 'Privacy & Data' ? 'font-bold' : ''}`}
                            onClick={() => handleSectionChange('Privacy & Data')}
                        >
                            Política de privacidad y datos
                        </li>
                    </ul>
                </div>

                {/* Contenido */}
                <div className="w-full lg:w-[55%] p-10 text-[#333333]">
                    {selectedSection === 'Account Info' && (
                        <div className="mx-auto">
                            <h2 className="text-2xl font-bold mb-5">Información de la cuenta</h2>

                            {/* Campo de Nombre y Apellido */}
                            <div className="mb-5 border-b border-gray-300 pb-3">
                                <p className="text-gray-700 font-bold">Nombre</p>
                                <div className="flex justify-between items-center">
                                    {isEditingName ? (
                                        <div className="flex flex-col w-full">
                                            <InputField
                                                type="text"
                                                className="border border-gray-300 rounded p-2 w-full"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Nombre"
                                            />
                                            <div className="flex gap-2 mt-2 w-full max-w-[348px]">
                                                <AuthButton className="flex-1" onClick={() => cancelEdit('name')} variant="secondary">
                                                    Cancelar
                                                </AuthButton>
                                                <AuthButton
                                                    className="flex-1"
                                                    onClick={() => updateUserCredential('firstname', name)}
                                                >
                                                    Continuar
                                                </AuthButton>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between w-full">
                                            <p className="text-[16px]">{name}</p>
                                            <button onClick={() => setIsEditingName(true)} className="text-blue-500">
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <p className="text-gray-700 font-bold mt-5">Apellido</p>
                                <div className="flex justify-between items-center">
                                    {isEditingLastname ? (
                                        <div className="flex flex-col w-full">
                                            <InputField
                                                type="text"
                                                className="border border-gray-300 rounded p-2 w-full"
                                                value={lastname}
                                                onChange={(e) => setLastname(e.target.value)}
                                                placeholder="Apellido"
                                            />
                                            <div className="flex gap-2 mt-2 w-full max-w-[348px]">
                                                <AuthButton className="flex-1" onClick={() => cancelEdit('lastname')} variant="secondary">
                                                    Cancelar
                                                </AuthButton>
                                                <AuthButton
                                                    className="flex-1"
                                                    onClick={() => updateUserCredential('lastname', lastname)}
                                                >
                                                    Continuar
                                                </AuthButton>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between w-full">
                                            <p className="text-[16px]">{lastname}</p>
                                            <button onClick={() => setIsEditingLastname(true)} className="text-blue-500">
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>


                            </div>




                            {/* Campo de Teléfono */}
                            <div className="mb-5 border-b border-gray-300 pb-3">
                                <p className="text-gray-700 font-bold">Número de teléfono</p>
                                <div className="flex justify-between items-center">
                                    {isEditingPhone ? (
                                        <div className="flex flex-col gap-2">
                                            <InputField
                                                type="text"
                                                className="border border-gray-300 rounded p-2 w-full"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                            />
                                            {isCodeSent ? (
                                                <>
                                                    <InputField
                                                        type="text"
                                                        className="border border-gray-300 rounded p-2 w-full"
                                                        placeholder="Código de Verificación"
                                                        value={verificationCode}
                                                        onChange={(e) => setVerificationCode(e.target.value)}
                                                    />
                                                    <div className="flex gap-2 mt-2">
                                                        <AuthButton onClick={() => cancelEdit('phone')} variant="secondary">Cancelar</AuthButton>
                                                        <AuthButton onClick={handleConfirmVerificationCode}>Confirmar cambio</AuthButton>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex gap-2 mt-2">
                                                    <AuthButton onClick={() => cancelEdit('phone')} variant="secondary">Cancelar</AuthButton>
                                                    <AuthButton onClick={handleSendVerificationCode}>Enviar Código</AuthButton>
                                                </div>
                                            )}
                                            {phoneError && <p className="text-red-500 text-sm mt-1 text-center font-Poppins font-light">{phoneError}</p>}
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-[16px]">{`${phoneCode} ${phone}`}</p>
                                            <div className="flex items-center gap-1">
                                                {verifiedStatus.phone ? (
                                                    <CheckCircleIcon className="h-5 w-5 text-green-500" title="Verificado" />
                                                ) : (
                                                    <ExclamationCircleIcon className="h-5 w-5 text-red-500" title="Falta verificar" />
                                                )}
                                                <button onClick={() => setIsEditingPhone(true)} className="text-blue-500">
                                                    <PencilIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>





                            {/* Campo de Email */}
                            <div className="mb-5 border-b border-gray-300 pb-3">
                                <p className="text-gray-700 font-bold">Email</p>
                                <div className="flex justify-between items-center">
                                    {isEditingEmail ? (
                                        <div className="flex flex-col gap-2">
                                            <InputField
                                                type="email"
                                                className="border border-gray-300 rounded p-2 w-full"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                            {isCodeSent ? (
                                                <>
                                                    <InputField
                                                        type="text"
                                                        className="border border-gray-300 rounded p-2 w-full"
                                                        placeholder="Código de Verificación"
                                                        value={verificationCode}
                                                        onChange={(e) => setVerificationCode(e.target.value)}
                                                    />
                                                    <div className="flex gap-2 mt-2">
                                                        <AuthButton onClick={() => cancelEdit('email')} variant="secondary">Cancelar</AuthButton>
                                                        <AuthButton onClick={handleConfirmVerificationCodeForEmail}>Confirmar cambio</AuthButton>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex gap-2 mt-2">
                                                    <AuthButton onClick={() => cancelEdit('email')} variant="secondary">Cancelar</AuthButton>
                                                    <AuthButton onClick={handleSendVerificationCodeForEmail}>Enviar Código</AuthButton>
                                                </div>
                                            )}
                                            {emailError && <p className="text-red-500 text-sm mt-1 font-Poppins font-light text-center">{emailError}</p>}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 w-full">
                                            <p className="text-[16px] flex-1">{email}</p>
                                            {verifiedStatus.email ? (
                                                <CheckCircleIcon className="h-5 w-5 text-green-500" title="Verificado" />
                                            ) : (
                                                <ExclamationCircleIcon className="h-5 w-5 text-red-500" title="Falta verificar" />
                                            )}
                                            <button onClick={() => setIsEditingEmail(true)} className="text-blue-500">
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className='flex justify-end'>
                                <button
                                    onClick={() => {
                                        const isConfirmed = window.confirm("¿Estás seguro de que deseas bloquear la cuenta?");
                                        if (isConfirmed) {
                                            handleBlockAccount();
                                        }
                                    }}
                                    className="bg-red-600 hover:bg-red-700 mt-5 font-Poppins text-white font-medium py-2 px-4 rounded shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 text-left"
                                >
                                    Bloquear Cuenta
                                </button>
                            </div>


                        </div>
                    )}

                    {selectedSection === 'Security' && (



                        <div>
                            <div className="text-[#333333] mb-5 border-b border-gray-300 pb-3">
                                <h2 className="text-2xl font-bold mb-5">Cambiar Contraseña</h2>

                                {!isEditingPassword ? (
                                    // Etapa inicial: Contraseña oculta y botón de edición
                                    <div className="flex justify-between items-center mb-5">
                                        <p className="text-[16px]">●●●●●●●●</p>
                                        <button
                                            onClick={() => router.push('/change-password')}
                                            className="text-blue-500"
                                        >
                                            <PencilIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                ) : (
                                    // Resto del código de edición de contraseña
                                    <>
                                        {/* Código de edición de contraseña aquí */}
                                    </>
                                )}
                            </div>

                            {/* Cuentas vinculadas */}
                            <div className="mb-5 border-b border-gray-300 pb-3">
                                <p className="text-gray-700 font-bold">Cuentas vinculadas</p>
                                <div>
                                    {authentications.map((auth, index) => (
                                        auth.allowed && (
                                            <div key={index} className="flex justify-between items-center">
                                                <p className="text-[16px] my-2">{auth.methodType}</p>
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                        </div>


                    )}



                    {selectedSection === 'Privacy & Data' && (
                        <div>
                            <div className="text-[#333333] border-b border-gray-300 pb-3">
                                <h2 className="text-2xl font-bold mb-5">Política de privacidad</h2>
                                {allowedApplications.map((app, index) => (
                                    <div key={index} className="mb-4">
                                        <p className="font-medium">{app.name}</p>
                                        <p className="text-gray-700">{app.description}</p>

                                        <ul className='list-disc mx-5 my-3 flex flex-col gap-y-[5px]'>
                                            <li>  <a href={app.privacyPolicy} target="_blank" rel="noopener noreferrer" className="underline text-[#0057b8]">
                                                Política de Privacidad
                                            </a>

                                            </li>
                                            <li>
                                                <a href={app.termsOfService} target="_blank" rel="noopener noreferrer" className="underline text-[#0057b8]">
                                                    Términos de Servicio
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}



                </div>
            </div>
        </div>
    );
};

export default Cuenta;
