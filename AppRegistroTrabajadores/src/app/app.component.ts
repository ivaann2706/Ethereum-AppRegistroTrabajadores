import { Component } from '@angular/core';
import Web3 from 'web3';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'AppRegistroTrabajadores';

  Acounts: Acount[];


  acountSelected: Acount = {
    address: '',
    registers: []
  };

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


    this.Acounts = [
      {
        address: 'Cuenta1',
        registers: ['0000', '0001']
      },
      {
        address: 'Cuenta2',
        registers: ['0002', '0003']
      },
      {
        address: 'Cuenta3',
        registers: ['0004', '0005']
      }

    ];

    if (this.Acounts.length > 0) {
      this.acountSelected = this.Acounts[0];
    }

  }

  Register() {

    console.log('Register()');

    this.web3.eth.getAccounts().then(accounts => {
      // Get the account which create the contract
      let creatorAccount = accounts[0];
      //Deploy contract
      let contractDeployed = new this.web3.eth.Contract(this.abi, '0xB67Ab38808eDA474d231288e5EE1dfeCa92bF92A');
      console.log('Contract address: ' + contractDeployed.options.address);

      contractDeployed.methods.Register().send({ from: creatorAccount }, (err, data) => {
        if (err) {
          console.log(`error: ${err}`);
          return;
        }

        contractDeployed.methods.GetMyRegistries().call({ from: creatorAccount }, (err, data) => {
          console.log('MyRegistries: ');
          console.log(data);
        });
      });
    });




  }

  GetRegisters() {
    this.acountSelected.registers.forEach(element => {
      console.log(element);
    });
  }


}

interface Acount {
  address: string;
  registers: string[];
}