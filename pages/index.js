


import { useState, useEffect } from 'react';
import { buildAuthUri } from '@/helpers/buildUri';
import Meta from '@/Layouts/Meta';


const Cuenta = () => {
   



    useEffect(() => {
        const authUri = buildAuthUri();
        window.location.href = authUri;
    }, []);




    return (
        
            <div>
            <div className='w-full h-screen flex justify-center items-center'>
                <div className="flex flex-row gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce"></div>
                    <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:-.3s]"></div>
                    <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:-.5s]"></div>
                </div>
            </div>
             </div>
  
    );
};

export default Cuenta;
