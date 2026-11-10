

import './Application.css'
import {Applicationform} from './Applicationform'

export function Application({setAppId}){

  return(
    <>
    <section className="application_page">
      <div className="application_heading">
        Analyze <span className='color'>Permissions</span>
        <p className='para'>Enter your app details and app permissions to get an AI-powered privacy analysis.</p>
      </div>

      <Applicationform setAppId={setAppId}/>

      

      
    </section>

    </>
  )

  
}