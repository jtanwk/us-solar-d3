/*
SHINING A LIGHT ON US HOUSEHOLD SOLAR ENERGY GENERATION
JONATHAN TAN
MASTER JS FILE

AS OF MARCH 5, 2019
*/

// LOAD DATA
Promise.all([
    fetch("data/processed-data/gen-by-year.json")
        .then(data => data.json())
        .then(data => {
            console.log("Dataset 1 loaded.");
            console.table(data[0]);

            // Line chart - heavily adapted from
            // http://bl.ocks.org/asielen/44ffca2877d0132572cb
            return makePlot1(data);
        }),
    fetch("data/processed-data/gen-ghi-panels-2016.json")
        .then(data => data.json())
        .then(data => {
            console.log("Dataset 2 loaded.");
            console.log(data[0]);
            return makePlot2(data), makePlot3(data), makePlot4(data);
        }),
    new Promise((resolve, reject) => {
        resolve('Data correctly loaded.');
    })
]).then(results => {
    console.log(results);
}).catch(error => {
    console.log(error);
    printError();
});


// DEFINE ERROR MESSAGE
function printError() {
    const message = `
    | ￣￣￣￣￣ | <br />
    | &nbsp; ERROR &nbsp; &nbsp; &nbsp; | <br />
    | &nbsp; LOADING &nbsp;| <br />
    | &nbsp; DATA &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;| <br />
    | ＿＿＿＿＿ | <br />
    (\\__/) || <br />
    (•ㅅ• ) || <br />
    / 　 づ`

    document.getElementById("errMsg").innerHTML = message;
}

//
