const fs = require('fs');
const Web3 = require('web3');
const CryptoJS = require('crypto-js');
// const coder = require('./web3/lib/solidity/coder');




// ropsten
// const web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/' + process.env.projectId));
// var web3 = new Web3(new Web3.providers.HttpProvider('https://api.myetherapi.com/rop'));
// // mainnet
// var web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/'));
// var web3 = new Web3(new Web3.providers.HttpProvider('https://api.myetherapi.com/eth'));
// // private(local)
const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545/'));
const contractJSON = JSON.parse(fs.readFileSync('./eth/contractSample.json'), 'utf8');
const abi = contractJSON.abi;
const myAddress = '0x046d7cf1F6095985DE0051C96D4A6113d8097bc0';
const contractAddress = '0x7BcCe5194EF2380b5eE9C9Fd27bF93186c4B0109';
const option = {
    from: myAddress, // default from address
    gas: '210000',
    gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
}

const contract = new web3.eth.Contract(abi, contractAddress, option);

/**
 * contract Method 관련하여 contractSample.sol 을 참조
 */
contract.methods.set_data(100).send();
contract.methods.get_data().call().then( (result) =>{
    console.log('mydata:', result);
});

// getWhiteListAddress(ruleAddress) {
//     var instance = this.web3.eth.contract(this.ruleAbi).at(ruleAddress)
//     return new Promise(function (resolve, reject) {
//         instance.whitelist(function(err, result) {
//             if(err) { reject(err); } else { resolve(result); }
//         });
//     });
// }
// signature + parameter
const contractData = function(functionName, types, args) {
    var fullName = functionName + '(' + types.join() + ')'
    var signature = CryptoJS.SHA3(fullName,{outputLength:256}) .toString(CryptoJS.enc.Hex).slice(0, 8) // The first 32 bit
    var dataHex = signature + coder.encodeParams(types, args)
    return '0x'+dataHex;
}

const data = contractData('set_data', ['uint256'], [10]);
console.log(data);

