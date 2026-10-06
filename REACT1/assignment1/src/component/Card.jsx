import React from 'react'

const Card = () => {
  return (
    <div>
      <div style={{backgroundColor: 'white', color: 'Black' , border: '2px solid black', width: '300px', height: '300px', textAlign: 'center', marginTop: '20px', marginLeft: '20px', borderRadius: '20px'}}>
        <h1 style={{color:'black'}}> Pizza </h1>
        <p><img src="https://jambubakers.com/wp-content/uploads/2023/07/pizza.png" alt="" height={'100px'} width={'100px'}/></p>
        <h3>PRICE: 10$</h3>
      </div>
      
    </div>
  )
}

export default Card
