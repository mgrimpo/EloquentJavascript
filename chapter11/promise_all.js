function Promise_all(promises) {
    return new Promise((resolve, reject) => {
        let results = [];
        let numPending = promises.length;
        if (numPending == 0) resolve(results);
        for (let i = 0; i < promises.length; i++){
            promises[i]
            .then( result => {
                results[i] = result;
                numPending--;
                if(numPending == 0)
                    resolve(results);
            })
            .catch(reject);
        }
    });
}

// Test code.
Promise_all([]).then(array => {
    console.log("This should be []:", array);
});
function soon(val) {
    return new Promise(resolve => {
        setTimeout(() => resolve(val), Math.random() * 500);
    });
}
Promise_all([soon(1), soon(2), soon(3)]).then(array => {
    console.log("This should be [1, 2, 3]:", array);
});
Promise_all([soon(1), Promise.reject("X"), soon(3)])
    .then(array => {
        console.log("We should not get here");
    })
    .catch(error => {
        if (error != "X") {
            console.log("Unexpected failure:", error);
        }
        else console.log("Caught expected rejection:", error);
    });