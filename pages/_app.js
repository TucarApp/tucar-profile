import '@/styles/globals.css'
import Meta from '@/Layouts/Meta'


export default function App({ Component, pageProps }) {
  return (
    <Meta title='Profile'>
      
      <Component {...pageProps} />
    </Meta>
  )
}
