function f1() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log("HI");
            resolve();
        }, 4000);
    })
}

function f2() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log("ABES");
            resolve();
        }, 1000);
    })
}

function f3() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log("How are you?");
            resolve();
        }, 2000);
    })
}

function f4() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log("I am fine");
            resolve();
        }, 3000);
    })
}


async function test() {
    try{

        await f1();
        await f2();
        await f3();
        await f4();
    } 
    catch(err) {
        console.log("ERROR", err);
    }
}

test();