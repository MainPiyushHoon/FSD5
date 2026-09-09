import React from 'react'

const Card = () => {
return (
    <div>
        <div style={{border: '2px solid black', width: '300px', height: '300px', borderRadius: '10px' , textAlign: 'center'}}>
            <h1>MY CAR</h1>
            <p> <img src="https://static.vecteezy.com/system/resources/thumbnails/053/733/048/small/modern-car-captured-in-close-upgraphy-with-precision-and-innovation-free-photo.jpg" alt="" height={'100px'} width={'150px'}></img></p>
            <h2>CAR NAME: McLaren P1 GTR</h2>
            <h2>PRICE: FREE</h2>
        </div>
    </div>
)
}

export default Card
