import { useState } from 'react'
import ComponentApp from './component/counterApp'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <ComponentApp></ComponentApp>
  )
}

export default App
