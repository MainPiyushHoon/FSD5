function test1(cb){
    setTimeout(() => {
        console.log("test1");
        cb();
    }, 1000);
}

function test2(cb){
    setTimeout(() => {
        console.log("test2");
        cb();
    }, 2000);
}

function test3(cb){
    setTimeout(() => {
        console.log("test3");
        cb();
    }, 3000);
}

function test4(cb){
    setTimeout(() => {
        console.log("test4");
        cb();
    }, 4000);
}

function test5(cb){
    setTimeout(() => {
        console.log("test5");
        cb();
    }, 5000);
}

function test6(cb){
    setTimeout(() => {
        console.log("test6");
        cb();
    }, 6000);
}

function test7(cb){
    setTimeout(() => {
        console.log("test7");
        cb();
    }, 7000);
}

function test8(cb){
    setTimeout(() => {
        console.log("test8");
        cb();
    }, 8000);
}

function test9(cb){
    setTimeout(() => {
        console.log("test9");
        cb();
    }, 9000);
}
function test10(cb){
    setTimeout(() => {
        console.log("test10");
        cb();
    }, 10000);
}

// Callback Hell
let start = Date.now();
test1(function(){
    test2(function(){
        test3(function(){
            test4(function(){
                test5(function(){
                    test6(function(){
                        test7(function(){
                            test8(function(){
                                test9(function(){
                                    test10(function(){
                                        console.log("All tests completed");
                                        let end = Date.now();
                                        let timeTaken = (end - start) / 1000;
                                        console.log("Time taken: " + timeTaken + " seconds");
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});