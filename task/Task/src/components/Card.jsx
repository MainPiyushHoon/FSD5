import React from 'react'
import { useState } from 'react'

const Card = () => {
    const [height, setHeight] = useState(20);
    const [width, setWidth] = useState(50);
    function colInc() {
        setHeight(height + 10);
    }
    function colDec() {
        setHeight(height - 10);
    }
    function rowInc() {
        setWidth(width + 10);
    }
    function rowDec() {
        setWidth(width - 10);
    }
  return (
    <div id= 'Card' style={{backgroundColor: 'lightblue', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '600px', height: '600px'}}>
        <div>
        <img src='https://i.pinimg.com/236x/76/15/52/76155282ba7495e3678f10ab3802b6bf.jpg' style={{width: '400px', height: '400px'}}></img>
        </div>
        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100px', gap: '10px'}}>
        <button onClick={rowInc} style={{width: `${width}px`, height: `${height}px`}}>Row +</button>
        <button onClick={rowDec} style={{width: `${width}px`, height: `${height}px`}}>Row -</button>
        <button onClick={colInc} style={{width: `${width}px`, height: `${height}px`}}>Col +</button>
        <button onClick={colDec} style={{width: `${width}px`, height: `${height}px`}}>Col -</button>
        </div>
    </div>
    
  )
}

export default Card
