import React from 'react'
import { useNavigate} from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  const handlehome =()=>{
    navigate("/")
  }

  return (
    <div style={{backgroundColor:"rgb(17 24 39)",height:"100vh",textAlign:"center"}}>
    <img  style={{marginLeft:"auto",marginRight:"auto"}} src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/404/404-computer.svg" alt="404 Not Found"></img>
    <h1 style={{fontweight:"1200",opacity:"1",fontSize:"24px",lineHeight:"32px",color:'rgb(59 130 246)'}}>404 Not Found</h1>
    <p style={{color:"rgb(255 255 255)",fontSize:"40px",lineHeight:"40px",letterSpacing:"0px",fontWeight:"1800",margin:"30px"}}>Whoops! That page doesn’t exist.</p>
    <button onClick={handlehome}  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Back to Lobby</button>
    </div>
  )
  
}


