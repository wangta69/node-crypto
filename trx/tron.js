require('dotenv').config();
const TronGrid = require('trongrid');
const TronWeb = require('tronweb');

const moment = require('moment-timezone');
const async = require('async');

const tronWeb = new TronWeb({
    fullHost: process.env.TRON_FULLHOST
})
const fullNode = process.env.TRON_FULLHOST;
const solidityNode = process.env.TRON_SOLIDITYNODE;
const eventServer = process.env.TRON_EVENTSERVER;

// const tronWeb = new TronWeb(
//     fullNode,
//     solidityNode,
//     eventServer
//     // privateKey
// );

const tronGrid = new TronGrid(tronWeb);
tronWeb.plugin.register(TronGrid, {experimental: null});

function Tron() {
    /**
     * 사용자 Address 생성
     * 1. address를 생성
     */
    this.createAddress = function(user, callback) {
        const account = tronWeb.createAccount();
        account.then((account) => {
            callback(null, {address: account.address.base58, secret: account.privateKey});
        });
    }

    /**
     * 출금처리 (사용자한테 보내는 것과 mainaddress로 이동하는 것)
     * 관리자 요청시 출금 처리한다.
     * @param amount : 1trx = 1000000 으로 전송시 계산하여 보낼것
     */
    const sendTrx = async(to, amount, from, privateKeyForFrom) => {
        // amount = amount * 1000000;
        const tronWeb = new TronWeb(
            fullNode,
            solidityNode,
            eventServer
             // privateKey
        );

        const tradeobj = await tronWeb.transactionBuilder.sendTrx(
            to,
            amount,
            from
        );
        const signedtxn = await tronWeb.trx.sign(
            tradeobj,
            privateKeyForFrom
        );
        const receipt = await tronWeb.trx.sendRawTransaction(
            signedtxn
        );
        return receipt;
     };

    this.checkTransaction = function() {
        const options = {
            only_to: true,
            only_confirmed: true,
            limit: 100,
            order_by: 'timestamp,asc',
            // min_timestamp: Date.now() - 60 000 // from a minute ago to go on
            min_timestamp: (moment().tz(process.env.timezone).unix() - 1800) * 1000 // 30분전
        };
        this.getTransactionsToAddress(address, options);
    }


    /**
     * 입금처리한다.
     * 5분 이후의 데이타 만 비교한다. (일종의 confirm 처리)
     * 이때 txID가 중복되지 않으면 db에 동일 txID가 있는지 한번 더 확인 하고 insert 한다.
     */
    this.getTransactionsToAddress = async function(address, options) {
        const self = this;
        tronGrid.account.getTransactions(address, options, (err, transactions) => {
            if (err) {
                self.checkTransaction();
                return console.error('getTransactions ' + address + 'error occur ===============');
            }
            for (const trans of transactions.data) {
                if (trans.raw_data.contract[0].type === 'TransferContract') {

                }
            }
            self.checkTransaction();
         });
     };
}

module.exports = Tron;
