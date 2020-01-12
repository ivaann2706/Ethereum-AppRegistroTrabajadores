const path = require('path');
const fs = require('fs');

//Lectura del .abi
const abiPath = path.resolve(__dirname, 'TimeControl.abi');
const abiRead = fs.readFileSync(abiPath, 'utf8');
const abi =JSON.parse(abiRead);

console.log(abiRead);
console.log(abi);

const Web3 = require('web3');

let web3 = new Web3(new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545"));

web3.eth.getAccounts().then(accounts => {

    //Get the account which create the contract
    let creatorAccount = accounts[0];

    //Deploy contract
    let contractDeployed = new web3.eth.Contract(abi, '0x8D0477145af8F71ACc867E9468F079F1966d0ba4');
    console.log('Contract address: ' + contractDeployed.options.address);

    contractDeployed.methods.Register().send({from: creatorAccount}, (err, data) => {
        if (err) {
            console.log(`error: ${err}`);
            return;
        }

        contractDeployed.methods.GetMyRegistries().call({ from: creatorAccount }, (err, data) => {
            console.log('MyRegistries: ');
            console.log(data);
        });
    });

    /*
    contractDeployed.methods.GetMyRegistries().call({ from: creatorAccount }, (err, data) => {
        console.log('MyRegistries: ');
        console.log(data);
    });
    */
});

