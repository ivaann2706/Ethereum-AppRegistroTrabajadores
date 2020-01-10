# Ethereum-AppRegistroTrabajadores
Aplicación web usando Ethereum donde los trabajadores de una organización deben fichar la hora a la que entran a su puesto de trabajo.

Este proyecto consta de dos partes. Por un lado, se monta una red de pruebas local Ethereum. Por otro lado, se desarrolla una simple aplicación web usando Angular.

* Herramientas y tecnologías usadas:
  * Ethereum
  * Solidity
  * Ganache
  * Remix
  * Angular



## Desarrollo contrato inteligente
Para el desarrollo del contrato inteligente se ha usado Remix por su facilidad para probar su funcionalidad. El contrato se escribe en el lenguaje Solidity.

```
pragma solidity ^0.6.1;

contract TimeControl{    
    
    address private owner;
    mapping (address => uint[]) private employeeRecords;
    
    constructor() public{        
        owner = msg.sender;
    }
    
   function Register() public{
       employeeRecords[msg.sender].push(now);
   }   
  
   function GetMyRegistries() public view returns (uint[] memory){
       
       uint[] memory result = new uint[] (employeeRecords[msg.sender].length);
       for (uint i = 0;i < employeeRecords[msg.sender].length; i++) {
           result[i] = employeeRecords[msg.sender][i];    
       }
        
        return result;
    }    
}
```
  
Algo que hay que tener en cuenta es la primera línea que vemos en nuestro código, que indica la versión que queremos utilizar de Solidity, en este caso la 0.6.1.

Remix está muy bien para empezar a desarrollar los contratos en Ethereum pero una vez que se refresca la página todo desaparece. Por lo que se preparará el entorno para el desarrollo en Ethereum en local.

En mi caso, estoy usando una máquina Ubuntu.

Lo primero que tenemos que hacer es instalar el compilador de Solidity.

```
sudo add-apt-repository ppa:ethereum/ethereum
sudo apt-get update
sudo apt-get install solc
solc --version
```

En mi caso, he usado Remix para escribir el contrato inteligente, pero igualmente se puede escribir en Visual Studio Code. Para trabajar con Solidity en este editor es recomendable instalar la [extensión de Juan blanco](https://marketplace.visualstudio.com/items?itemName=JuanBlanco.solidity).

Una vez escrito el contrato, se puede compilar usando el siguiente comando:
```
solc TimeControl.sol --bin --abi --optimize -o bin
```
Esto último nos generará dos archivos: TimeControl.bin y Timecontrol.abi. El archivo .bin es el bytecode que las EVM (Ethereum Virtual Machine) instaladas en los nodos de una red de Ethereum son capaces de ejecutar. El archivo .abi es la Application Binary Interface (ABI), que describe el contrato en formato JSON. Este archivo se utiliza en el lado del cliente para poder llamar a nuestro contrato ya desplegado en una red Ethereum.

Otra opción que tenemos para compilar nuestro contracto inteligente es a través del módulo de solc en Node.js. Para ello, necesitamos instalarlo en nuestro proyecto, lo cual será más portable que instalarlo solc en la máquina local:

```
sudo npm install solc --save-dev
```

Creamos el siguiente script llamado CompileAndDeployContract.js para compilarlo:
```javascript
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
```

En las variables abi y bytecode se recuperan el ABI y el bytecode. Para lanzar el script se hace con el siguiente comando:

```
node CompileAndDeployContract.js
```

Con este script lo que se ha hecho es únicamente compilar el contrato inteligente.

## Despliegue del contrato en Ganache
Para el despliegue del contrato inteligente se va a usar Ganache. Ganache es un software que nos proporciona una red de pruebas local muy sencilla. Para instalarlo, solo tienes que ir a su [página oficial](https://truffleframework.com/ganache) y descargar el ejecutable. Una vez instalado y ejecutado, se tendrá una red Ethereum disponible en tu máquina.

Una vez lista la red Ethereum, se despliega el contrato anteriormente desarrollado. Para ello se va a hacer uso de la libreria web3.js, por lo que la instalamos en nuestro proyecto a través de npm.

```
sudo npm install web3
```

 A continuación de nuestro código anterior añadimos el código del despliegue, quedando de la siguiente manera.

```javascript
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
```

La URL del HttpProvider corresponde a la dirección donde está a la escucha Ganache.

Desplegar un contrato es una transacción dentro de Ethereum, por lo que se recupera una de las cuentas que tenemos disponibles de prueba, para poder enviar dicha transacción a Ganache. Una vez que se tiene una cuenta, creamos una instancia del contrato, utilizando el ABI guardado anteriormente, y a través de la función deploy lo desplegamos en la red, mandando el bytecode, la cuenta que va a hacer la transacción y el gas que aportamos para ello.

Una vez lanzado el script completo, se tendrá como resultado el hash de la transacción generada para la creación del smart contract. Además, si echas un vistazo a la UI de Ganache verás que la primera cuenta ha perdido ethers al lanzar la creación del contrato. Se puede observar desde el apartado bloques que se ha creado uno nuevo y desde transacciones se puede observar que se ha creado una nueva transacción correspondiente a la creación del contrato.

## Prueba del contrato desplegado en Ganache

Para probar que todo funciona correctamente vamos a lanzar algunas llamadas. Para ello se crea una instancia del contrato pasándole el ABI y la dirección del contrato.

El script Test.js creado para las pruebas es el siguiente:
```javascript
const path = require('path');
const fs = require('fs');

//Lectura del .abi
const abiPath = path.resolve(__dirname, 'TimeControl.abi');
const abiRead = fs.readFileSync(abiPath, 'utf8');
const abi =JSON.parse(abiRead);

const Web3 = require('web3');

let web3 = new Web3(new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545"));

web3.eth.getAccounts().then(accounts => {

    //Get the account which create the contract
    let creatorAccount = accounts[0];

    //Deploy contract
    let contractDeployed = new web3.eth.Contract(abi, '0x3e0385258Cd7F07C69308EEd1E0DE9dd84214F4B');
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
```

Aquí se observa que se llama a la función Register para registrar un fichaje y la función GetMyRegistries para que devuelva los fichajes de la cuenta.


Hasta aquí se ha visto como se crea un contrato, se despliega en una red de pruebas local y se lanza algunas llamadas para probarlo. Estas llamadas se han hecho a través del terminar ejecutando scripts. A continuación se desarrollará una pequeña interfaz web para interactuar con el contrato desplegado.













