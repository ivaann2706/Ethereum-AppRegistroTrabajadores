const path = require('path');
const fs = require('fs');
const solc = require('solc');

const contractPath = path.resolve(__dirname, 'TimeControl.sol');
const source = fs.readFileSync(contractPath, 'utf8');

let jsonContractSource = JSON.stringify({
    language: 'Solidity',
    sources: {
        'TimeControl': {
            content: source,
        },
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['abi', "evm.bytecode"]
            },
        },
    },
});

let solcResult = solc.compile(jsonContractSource);
const abi = JSON.parse(solcResult).contracts.TimeControl.TimeControl.abi;
const bytecode = JSON.parse(solcResult).contracts.TimeControl.TimeControl.evm.bytecode.object;
const Web3 = require('web3');

let web3 = new Web3(new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545"));

web3.eth.getAccounts().then(accounts => {

    //Get the account which create the contract
    let creatorAccount = accounts[0];

    //Deploy contract
    const contract = new web3.eth.Contract(abi);

    contract.deploy({
        data: '0x' + bytecode

    }).send({
        from: creatorAccount,
        gas: 1500000,
        gasPrice: '30000000000000'
    }, (error, transactionHash) => {

        if(error){
            console.log(`error: ${error}`);
        }
        else{
            console.log(`transaction hash: ${transactionHash}`);
        }        
    });
});