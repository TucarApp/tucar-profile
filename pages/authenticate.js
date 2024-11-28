import { useState, useEffect } from 'react';
import { PencilIcon, XIcon, MenuIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/solid';
import TucarLogo from '../components/LogoTucar/LogoTucar';
import AuthButton from '@/components/Auth/AuthButton';
import InputField from '@/components/Auth/InputField';

import { useRouter } from 'next/router';


import { useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';


const Cuenta = () => {
    const [selectedSection, setSelectedSection] = useState('Account Info');
    const router = useRouter();

    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);

    const [allowedApplications, setAllowedApplications] = useState([]);

    const [name, setName] = useState('');
    const [lastname, setLastname] = useState('');
    const [phone, setPhone] = useState('');
    const [phoneCode, setPhoneCode] = useState('');
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [isCodeSent, setIsCodeSent] = useState(false);

    const [changePasswordStatus, setChangePasswordStatus] = useState(null);
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

    const [isLoading, setIsLoading] = useState(true);


    // useEffect(() => {
    //     if (token && userData) {
    //         window.history.replaceState(null, '', '/profile');
    //     }
    // }, [token, userData, verifiedStatus]);

    useEffect(() => {
    // Verifica si los datos están cargados
    if (token && userData) {
        
        // Asegúrate de que la URL sea /profile
        if (window.location.pathname !== '/profile') {
            window.history.replaceState(null, '', '/profile');
        }
    } else if (!token && window.location.pathname === '/profile') {
        // Si no hay token y estamos en /profile, redirige al inicio
        router.push('/');
    }
}, [token, userData, verifiedStatus]);



    useEffect(() => {
        if (token && userData) {
            setIsLoading(false); // Todo cargado
        }
    }, [token, userData]);



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
                    redirect_uri: 'https://profile.tucar.dev/authenticate',
                    //dev
                    // redirect_uri: 'http://localhost:3000/authenticate',
                });

                const tokenResponse = await fetch(`https://account-service-1032838122231.us-central1.run.app/api/v1/oauth/token`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: body.toString(),
                });

                if (tokenResponse.ok) {
                    const tokenData = await tokenResponse.json();
                    setToken(tokenData.access_token); // Guardar el token en el estado

                    // Paso 2: Obtener el userId con el token
                    const userIdResponse = await fetchUserId(tokenData.access_token);

                    if (userIdResponse) {
                        setUserId(userIdResponse); // Guardar el userId en el estado

                        // Paso 3: Obtener datos del usuario con el token y userId
                        await fetchUserData(tokenData.access_token);
                    }
                } else {
                    const tokenError = await tokenResponse.json();
                    setError(tokenError.error_description || 'Error al obtener el token');
                }
            } catch (err) {
                setError('Error de conexión. Inténtalo nuevamente.');
            }
        };

        fetchTokenAndUserData();
    }, [searchParams]);

    // Función para obtener el userId
    const fetchUserId = async (acToken = null) => {
        try {
            const response = await fetch(`https://account-service-1032838122231.us-central1.run.app/api/v1/resources/token-metadata?token=${acToken ? acToken : token}`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                const data = await response.json();
                return data.user_id; // Devuelve el userId
            } else {
                const errorData = await response.json();
                return null;
            }
        } catch (error) {
            return null;
        }
    };

    // Función para obtener los datos del usuario
    const fetchUserData = async (acToken = null) => {
        try {
            const response = await fetch(`https://account-service-1032838122231.us-central1.run.app/api/v1/users/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${acToken ? acToken : token}`, // Pasar el token como Bearer
                },
            });

            if (response.ok) {
                const userData = await response.json();
                setUserData(userData); // Guardar los datos en el estado
            } else {
                const userError = await response.json();
                setError(userError.detail || 'Error al obtener los datos del usuario');
            }
        } catch (err) {
            setError('Error al obtener datos del usuario. Inténtalo nuevamente.');
        }
    };

    useEffect(() => {
        const loadData = async () => {
            const data = await fetchUserData();
            setUserData(data);

            if (data) {
                setName(data.allowedApplications[0].contactName || '');
                setLastname(data.allowedApplications[0].contactLastname || '');
                setPhone(data.allowedApplications[0].contactPhone || '');
                setPhoneCode(data.code || '');
                setEmail(data.allowedApplications[0].contactEmail || '');
                setVerifiedStatus({
                    email: data.verifiedElements?.email || false,
                    phone: data.verifiedElements?.phone || false,
                });
            }
            // Obtener el userId usando el token
            await fetchUserId();
        };
        if (token) {
            loadData()
        };

    }, [token]);

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

    const handleSectionChange = (section) => {
        setSelectedSection(section);
        setIsMenuOpen(false);
    };

    const cancelEdit = (field) => {
        if (field === 'name') setIsEditingName(false);
        if (field === 'lastname') setIsEditingLastname(false);
        if (field === 'phone') setIsEditingPhone(false);
        if (field === 'email') setIsEditingEmail(false);
        if (field === 'password') setIsEditingPassword(false);
        setVerificationCode('');
    };

    // Función para actualizar el nombre o apellido
    const updateUserCredential = async (type, value) => {
        try {
            const response = await fetch(`https://account-service-1032838122231.us-central1.run.app/api/v1/users/credentials`, {
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

    // const handleSendVerificationCode = async () => {
    //     try {
    //         const response = await fetch(`https://account-service-1032838122231.us-central1.run.app/api/v1/users/credentials`, {
    //             method: 'PATCH',
    //             headers: {
    //                 "Content-Type": "application/json",
    //                 Authorization: `Bearer ${token}`
    //             },
    //             body: JSON.stringify({
    //                 credential: {
    //                     type: "phone",
    //                     value: phone
    //                 },
    //                 userId: userId
    //             })
    //         });

    //         if (response.ok) {
    //             console.log("Número de teléfono actualizado correctamente.");
    //             setIsCodeSent(true);
    //             setPhoneError(''); // Limpiar error previo
    //             setChangePasswordStatus("Código de verificación enviado. Revisa tu teléfono.");
    //         } else {
    //             const errorData = await response.json();
    //             console.log("Error Data:", errorData); // Verificar la estructura de errorData

    //             if (errorData.detail && errorData.detail.errors === "Phone already in use") {
    //                 setPhoneError("Número de teléfono ya está en uso.");
    //             } else {
    //                 setPhoneError(errorData.detail?.message || "Error al enviar el código de verificación");
    //             }
    //             console.error("Error al actualizar el número de teléfono:", errorData);
    //         }
    //     } catch (error) {
    //         setPhoneError("Error de conexión. Inténtalo nuevamente.");
    //         console.error("Error:", error);
    //     }
    // };

   

    // const handleConfirmVerificationCode = async () => {
    //     try {
    //         const response = await fetch(`https://account-service-1032838122231.us-central1.run.app/api/v1/users/verify`, {
    //             method: 'PATCH',
    //             headers: {
    //                 "Content-Type": "application/json",
    //                 Authorization: `Bearer ${token}`
    //             },
    //             body: JSON.stringify({
    //                 credential: {
    //                     type: "phone",
    //                     value: verificationCode
    //                 },
    //                 userId: userId,

    //             })
    //         });
    //         if (response.ok) {
    //             console.log("Número de teléfono verificado correctamente");
    //             setVerifiedStatus((prevStatus) => ({ ...prevStatus, phone: true }));
    //             setIsEditingPhone(false);
    //             setIsCodeSent(false);
    //         } else {
    //             console.error("Error al verificar el número de teléfono:", response.statusText);
    //         }
    //     } catch (error) {
    //         console.error("Error:", error);
    //     }
    // };

    const handleSendVerificationCode = async () => {
        try {
            // Concatenar prefijo y número al enviar
            const fullPhoneNumber = `${phoneCode}${phone}`;
            console.log("Enviando número completo:", fullPhoneNumber);
    
            const response = await fetch(`https://account-service-1032838122231.us-central1.run.app/api/v1/users/credentials`, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    credential: {
                        type: "phone",
                        value: fullPhoneNumber // Usar el número completo
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
                if (errorData.detail && errorData.detail.errors === "Phone already in use") {
                    setPhoneError("Número de teléfono ya está en uso.");
                } else {
                    setPhoneError(errorData.detail?.message || "Error al enviar el código de verificación");
                }
            }
        } catch (error) {
            setPhoneError("Error de conexión. Inténtalo nuevamente.");
            console.error("Error:", error);
        }
    };
    
    const handleConfirmVerificationCode = async () => {
        try {
            const fullPhoneNumber = `${phoneCode}${phone}`;
            console.log("Verificando número completo:", fullPhoneNumber);
    
            const response = await fetch(`https://account-service-1032838122231.us-central1.run.app/api/v1/users/verify`, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    credential: {
                        type: "phone",
                        value: verificationCode // El código de verificación enviado por el usuario
                    },
                    userId: userId
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
            const response = await fetch(`https://account-service-1032838122231.us-central1.run.app/api/v1/users/credentials`, {
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
            const response = await fetch(`https://account-service-1032838122231.us-central1.run.app/api/v1/users/verify`, {
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
        // SweetAlert2 para confirmar la acción
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede deshacer. ¿Deseas bloquear tu cuenta?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, bloquear cuenta',
            cancelButtonText: 'Cancelar'
        });

        // Si el usuario cancela, no continúa
        if (!result.isConfirmed) {
            Swal.fire('Cancelado', 'La cuenta no fue bloqueada.', 'info');
            return;
        }

        try {
            const response = await fetch(`https://account-service-1032838122231.us-central1.run.app/api/v1/users/block`, {
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
                // Mensaje de éxito con cuenta regresiva antes de redirigir
                Swal.fire({
                    title: 'Cuenta bloqueada correctamente',
                    text: 'Redirigiendo al inicio en 5 segundos...',
                    icon: 'success',
                    timer: 5000,
                    timerProgressBar: true,
                    showConfirmButton: false,
                    willClose: () => {
                        // Redirige al home cuando el temporizador termina
                        window.location.href = '/';
                    }
                });
            } else {
                const errorData = await response.json();
                const errorMessage = "Error al bloquear la cuenta: " + (errorData.detail?.errors || response.statusText);
                setBlockStatus(errorMessage);
                Swal.fire('Error', errorMessage, 'error'); // Notificación de error
            }
        } catch (error) {
            console.error("Error:", error);
            const connectionError = "Error de conexión. Inténtalo nuevamente.";
            setBlockStatus(connectionError);
            Swal.fire('Error', connectionError, 'error'); // Notificación de error de conexión
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
                    {/* Botón de cerrar sesión fijo en la parte inferior */}
                    <div className="absolute bottom-10 lg:bottom-24 w-full p-5">
                        <button
                            onClick={() => router.push(`/logout?redirect_uri=${encodeURIComponent('https://profile.tucar.dev')}`)}
                            className="flex items-center gap-2 text-red-600 font-medium hover:text-red-800"
                        >
                            <XIcon className="h-5 w-5" />
                            Cerrar sesión
                        </button>
                    </div>
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
                                    {isLoading ? (
                                        <div className="h-6 bg-gray-300 animate-pulse rounded w-full"></div>
                                    ) : isEditingName ? (
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
                                                <AuthButton className="flex-1" onClick={() => updateUserCredential('firstname', name)}>
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
                                    {isLoading ? (
                                        <div className="h-6 bg-gray-300 animate-pulse rounded w-full"></div>
                                    ) : isEditingLastname ? (
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
                                                <AuthButton className="flex-1" onClick={() => updateUserCredential('lastname', lastname)}>
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
                                    {isLoading ? (
                                        <div className="h-6 bg-gray-300 animate-pulse rounded w-full"></div>
                                    ) : isEditingPhone ? (
                                        <div className="flex flex-col gap-2">


                                            <InputField
                                                type="text"
                                                className="border border-gray-300 rounded-r p-2 w-full"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="Ingresa tu número"
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
                                                        <AuthButton onClick={() => cancelEdit('phone')} variant="secondary">
                                                            Cancelar
                                                        </AuthButton>
                                                        <AuthButton onClick={handleConfirmVerificationCode}>Confirmar cambio</AuthButton>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex gap-2 mt-2">
                                                    <AuthButton onClick={() => cancelEdit('phone')} variant="secondary">
                                                        Cancelar
                                                    </AuthButton>
                                                    <AuthButton onClick={handleSendVerificationCode}>Enviar Código</AuthButton>
                                                </div>
                                            )}
                                            {phoneError && (
                                                <p className="text-red-500 text-sm mt-1 text-center font-Poppins font-light">{phoneError}</p>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            {/* Visualización del número completo */}
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
                                    {isLoading ? (
                                        <div className="h-6 bg-gray-300 animate-pulse rounded w-full"></div>
                                    ) : isEditingEmail ? (
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
                                                        <AuthButton onClick={() => cancelEdit('email')} variant="secondary">
                                                            Cancelar
                                                        </AuthButton>
                                                        <AuthButton onClick={handleConfirmVerificationCodeForEmail}>
                                                            Confirmar cambio
                                                        </AuthButton>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex gap-2 mt-2">
                                                    <AuthButton onClick={() => cancelEdit('email')} variant="secondary">
                                                        Cancelar
                                                    </AuthButton>
                                                    <AuthButton onClick={handleSendVerificationCodeForEmail}>Enviar Código</AuthButton>
                                                </div>
                                            )}
                                            {emailError && (
                                                <p className="text-red-500 text-sm mt-1 font-Poppins font-light text-center">
                                                    {emailError}
                                                </p>
                                            )}
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
                            <div className="flex justify-end mt-12 ">
                                <button onClick={handleBlockAccount} className="px-4 py-2 text-white font-Poppins font-medium bg-red-600 hover:bg-red-700 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                                    Bloquear cuenta
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
                                        <a href='https://accounts.tucar.dev/change-password' target='_blank'>                                        <button

                                            className="text-blue-500"
                                        >
                                            <PencilIcon className="h-5 w-5" />
                                        </button>
                                        </a>

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
                            <h2 className="text-2xl font-bold mb-5">Política de privacidad</h2>
                            {allowedApplications.map((app, index) => (
                                <div key={index}>
                                    <div className="pb-4">
                                        <p className="font-medium text-[#333333]">{app.name}</p>
                                        <p className="text-gray-600 text-sm">{app.description}</p>
                                        <ul className="list-disc mx-5 my-3 flex flex-col gap-y-2">
                                            <li>
                                                <a href={app.privacyPolicy} target="_blank" rel="noopener noreferrer" className="underline text-[#0057b8]">
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
                                    {/* Separador sutil entre apps */}
                                    <div className="border-t border-gray-300 my-2"></div>
                                </div>
                            ))}
                        </div>


                    )}


                </div>

            </div>
        </div>
    );
};

export default Cuenta;
