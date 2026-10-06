import React from 'react'
import { useState } from 'react'



const CounterApp = () => {
    const [count, setCount] = useState(0);
    function Inc(){
        setCount(count + 1);
    }
    function Dec(){
        setCount(count - 1);
    }
    function reset(){
        setCount(0);
    }
    function double(){
        setCount(count * 2);
    }
    function expo(){
        setCount(count ** count);
    }
return (
    <div>
    <h1>CounterApp</h1>
    <div id='buttons' style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '10px'}}>
    <button id="adder" onClick={Inc}> +</button>
    <button id="sub" onClick={Dec}> -</button>
    <button id="reset" onClick={reset}> Reset</button>
    <button id="double" onClick={double}> 2x</button>
    <button id="expo" onClick={expo}> expo</button>
    </div>
    <div>
        <h1 style={{fontFamily: 'comic-sans'}}> Count : {count}</h1>
    </div>
    </div>
)
}

export default CounterApp
