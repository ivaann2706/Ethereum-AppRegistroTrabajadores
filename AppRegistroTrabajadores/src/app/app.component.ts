import { Component } from '@angular/core';
import Web3 from 'web3';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'AppRegistroTrabajadores';

  acounts: string[];
  acountSelected: string = "";

  Web3 = require('web3');
  web3 = new this.Web3(new this.Web3.providers.HttpProvider("HTTP://127.0.0.1:7545"));

  abi = [
    { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
    {
      inputs: [],
      name: 'GetMyRegistries',
      outputs: [[Object]],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'Register',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    }
  ];


  constructor() {

    this.acounts = [];
    this.web3.eth.getAccounts().then(accounts => {
      accounts.forEach(item => {
        this.acounts.push(item)
      });  

    });

    if (this.acounts.length > 0) {
      this.acountSelected = this.acounts[0];
    }


  }

  Register() {

    console.log('Register()');

    this.web3.eth.getAccounts().then(accounts => {
      // Get the account which create the contract
      let creatorAccount = accounts[0];
      //Deploy contract
      let contractDeployed = new this.web3.eth.Contract(this.abi, '0x8D0477145af8F71ACc867E9468F079F1966d0ba4');
      console.log('Contract address: ' + contractDeployed.options.address);

      contractDeployed.methods.Register().send({ from: this.acountSelected }, (err) => {
        if (err) {
          console.log(`error: ${err}`);
          return;
        }
        /*
        contractDeployed.methods.GetMyRegistries().call({ from: creatorAccount },  function(error, result) {
          console.log('MyRegistries: ');
          console.log(result);
          if (error) {
            console.log(`errorr: ${error}`);
            return;
          }
          console.log('MyRegistries: ');
          console.log(result);
        });
        */
      });
    });




  }

  GetRegisters() {
    let contractDeployed = new this.web3.eth.Contract(this.abi, '0x8D0477145af8F71ACc867E9468F079F1966d0ba4');
    let x = contractDeployed.methods.GetMyRegistries().call({ from: this.acountSelected });
    console.log(x);
      
 
    /*
    this.acountSelected.registers.forEach(element => {
      console.log(element);
    });
    */
/*
    console.log(this.acountSelected);
    let contractDeployed = new this.web3.eth.Contract(this.abi, '0x8D0477145af8F71ACc867E9468F079F1966d0ba4');

    contractDeployed.methods.GetMyRegistries().call({ from: this.acountSelected }, (err, data) => {
      console.log('MyRegistries: ');
      
      let registros: string[];
      registros = data;
      
      console.log(typeof(data));
      console.log(registros);
    });
    */
  }


}

/*
interface Acount {
  address: string;
  registers: string[];
}
*/