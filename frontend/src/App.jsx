
import { useState } from 'react';
import './App.css'
import axios from 'axios'

function App() {

  const [name,setName] = useState();
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();

  const handleSubmit = async()=>{
    const response = await axios.post('http://localhost:6010/register',{
      name,
      username,
      password
    })
    console.log(response)
  }
 
  return (
    <div>
      <input type="text"  placeholder='Name...' value={name} onChange={(e)=>setName(e.target.value)}/>
      <input type="text"  placeholder='username...' value={username} onChange={(e)=>setUsername(e.target.value)}/>
      <input type="text"  placeholder='password...' value={password} onChange={(e)=>setPassword(e.target.value)}/>
      <button
      onClick={handleSubmit}
      >
        Submit 
      </button>
    </div>
  )
}

export default App
