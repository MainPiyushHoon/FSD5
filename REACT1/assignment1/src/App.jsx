import React from 'react'
import Header from './component/Header'
import Footer from './component/Footer'
import Card from './component/Card'


const App = () => {
  return (
    <div>
      <Header />
      <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap'}}>
      <Card />
      <Card />
      <Card />
      </div>
      <Footer />
    </div>
  )
}

export default App
