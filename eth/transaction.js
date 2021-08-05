// https://muyu.tistory.com/entry/Ethereum-web3js-%EC%82%AC%EC%9A%A9%EB%B2%95-%EA%B0%84%EB%8B%A8-%EC%9A%94%EC%95%BD
require('dotenv').config();
const fs = require('fs');
const util = require('util');
const Web3 = require('web3')
const Tx = require('ethereumjs-tx').Transaction;

// ropsten
// const web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/' + process.env.projectId));
// var web3 = new Web3(new Web3.providers.HttpProvider('https://api.myetherapi.com/rop'));
// // mainnet
// var web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/'));
// var web3 = new Web3(new Web3.providers.HttpProvider('https://api.myetherapi.com/eth'));
// // private(local)
const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545/'));
// local
const senderAddress = '0x046d7cf1F6095985DE0051C96D4A6113d8097bc0';
const senderPrivateKey = '26a9bc09259d11149228a41b5e12304e63a54baafe2994fc78114c3ed3756cdc'; // 0x를 제거하여야 한다.
const toAddress = '0x4b0303E7E38ea3C178223b91de965276b003Da54';

/**
 * nonce를  구할 수 있다.
 */

// const transactionObject = {
//     nonce: transactionCount, // the count of the number of outgoing transactions, starting with 0
//     gasPrice: gasPrice, // the price to determine the amount of ether the transaction will cost
//     gasLimit: gasLimit, // the maximum gas that is allowed to be spent to process the transaction
//     to: toAddress,
//     from: senderAddress,
//     data: data, // could be an arbitrary message or function call to a contract or code to create a contract
//     value: wei // unit wei the amount of ether to send };
// }
async function getTransactionCount(from) {
    return await web3.eth.getTransactionCount(from);
}

async function getGasPrice() {
    return await web3.eth.getGasPrice();
}

/**
 *@param param { to, from, value }
 */
async function estimateGas(params) {
    return await web3.eth.estimateGas(params);
}

/**
 *@param param { nonce, gasPrice, gasLimit, to, from, value }
 */
async function sendTransaction(params) {
    return web3.eth.sendTransaction(params);
}

async function getBalance(address) {
    return await web3.eth.getBalance(address);
}

async function sendEther(to, amount, from) {
    const nonce = await getTransactionCount(from);
    const gasPrice = await getGasPrice();
    const value = web3.utils.toWei(amount.toString(), 'ether');
    const gasLimit = await estimateGas({ to: toAddress, from: from, value: value }); // the used gas for the simulated call/transaction (,,21000)

    const txObject = {
        nonce: nonce,
        gasPrice: gasPrice,
        gasLimit: gasLimit,
        to: to,
        from: from,
        value: value
    };

    const transactionHash = await sendTransaction(txObject);
}

async function sendRawEther(to, amount, from) {
    const nonce = await getTransactionCount(from);
    const gasPrice = await getGasPrice();
    const value = web3.utils.toWei(amount.toString(), 'ether');
    const gasLimit = await estimateGas({ to: toAddress, from: from, value: value }); // the used gas for the simulated call/transaction (,,21000)

    const rawTx = {
        nonce: web3.utils.toHex(nonce),
        gasPrice: web3.utils.toHex(gasPrice),
        gasLimit: web3.utils.toHex(210000),
        // gasLimit: web3.utils.toHex(gasLimit),
        to: to,
        from: from,
        data: '0x00', // could be an arbitrary message or function call to a contract or code to create a contract
        value: web3.utils.toHex(value)
    };

    const tx = new Tx(rawTx);
    const privateKeyBuffer = Buffer.from(senderPrivateKey, 'hex');
    console.log('privateKeyBuffer', privateKeyBuffer, senderPrivateKey);


    tx.sign(privateKeyBuffer);
    const serializedTx = tx.serialize();
    const transactionHash = web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
}

// sendEther(toAddress, 1, senderAddress);
sendRawEther(toAddress, 1, senderAddress);

async function getUserBalance(address) {
    const balance = await getBalance(toAddress);
    return balance;
}

getUserBalance(toAddress).then((balance) =>{
    console.log('balance', balance);
});



