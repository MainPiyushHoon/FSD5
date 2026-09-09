import React from 'react'
import Card from './components/Card.jsx'
const App = () => {
  return (
    <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap'}}>
      <Card/>
      <br />
      <Card/>
      <br />
    </div>
  )
}



export default App
