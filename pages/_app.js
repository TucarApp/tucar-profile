import '@/styles/globals.css'
import Meta from '@/Layouts/Meta'
import { ToastContainer } from 'react-toastify';

export default function App({ Component, pageProps }) {
  return (
    <Meta title='Profile'>
       <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
      <Component {...pageProps} />
    </Meta>
  )
}
