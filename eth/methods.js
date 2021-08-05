
const Web3 = require('web3');
// ropsten
// const web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/' + process.env.projectId));
// var web3 = new Web3(new Web3.providers.HttpProvider('https://api.myetherapi.com/rop'));
// // mainnet
// var web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/'));
// var web3 = new Web3(new Web3.providers.HttpProvider('https://api.myetherapi.com/eth'));
// // private(local)
const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545/'));

/**
 * gas Price를 가져오기
 */
async function getGasPrice() {
    return await web3.eth.getGasPrice();
}

/**
 * Gas limit 계산
 * @param param { to, from, value }
 */
 async function estimateGas(params) {
     return await web3.eth.estimateGas(params);
 }


/**
 * 잔고 가져오기
 */
 async function getBalance(address) {
     return await web3.eth.getBalance(address);
 }


/**
 * nonce를  구할 수 있다.
 */
async function getTransactionCount(address) {
    return await web3.eth.getTransactionCount(address);
}


