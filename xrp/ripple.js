require('dotenv').config();

const async = require('async');
const RippleAPI = require('ripple-lib').RippleAPI;
const myAddress = process.env.RIPPLE_ADDRESS; // 실서버 운영시 이 부분을 반드시 수정

function Ripple() {
    const self = this;
    let maxLedgerVersion;
    let connected = false;


    /*
     * api를 생성한다.
     */
    this.api = new RippleAPI({
        server: process.env.RIPPLE_API_SERVER
    });

    this.api.on('error', (errorCode, errorMessage) => {
      console.error(errorCode + ': ' + errorMessage);
    });

    this.api.on('connected', () => {
       console.log('on connected ');
    });

    this.api.on('disconnected', (code) => {
        console.log('disconnected, code:', code);
        this.connected = false;
    });

    this.api.connect().then(() => {
        console.log('api connected');
        this.connected = true;
        return;
    }).then(() => {
        // transaction 확인 (입금 확인 process)
        // 1. call request  with subscribe and my account
        // 2. call transaction
        /**
         * 나의 메인 지갑을 보다가 이곳에 들어오는 accounts만 생각하면 된다.
         * 내가 보낸 것인지 아니면 내가 받은 것인지
         */
        this.api.connection.request({
            command: 'subscribe',
            accounts: [ myAddress ]
        })
        .then(response => {
            if (response.status === 'success') {
                console.info('Successfully subscribed')
            }
        }).catch(error => {
            console.error(error);
        })

        // 위의 subscribe에서 myaddress로 transaction 이 발생하면 아래가 실행된다.
        this.api.connection.on('transaction', (event) => {
            if (event.engine_result_code === 0) {

            }
        })

        this.api.on('ledger', ledger => {
            if (ledger.ledgerVersion > maxLedgerVersion) {
                console.info('If the transaction hasn\'t succeeded by now, it\'s expired')
            }
        })

    }).catch((error) => {
        if (error) {
            console.error(error);
        }
    });


    // Continuing after connecting to the API
    /**
     * 코인전송을 위한 prepare
     * @param from : 인출할 주소
     * @param to : 전송할 주소
     * @param tag : Destination Tag
     * @param amount: 전송할 금액
     */
    this.doPrepare = async function(from, to, tag, amount) {
        const preparedTx = await self.api.prepareTransaction(
            {
                'Account': from,
                'TransactionType': 'Payment',
                'Amount': self.api.xrpToDrops(amount),
                'Destination': to,
                'DestinationTag': tag ? parseInt(tag, 10) : 0
            }, {
                // Expire this transaction if it doesn't execute within ~5 minutes:
                'maxLedgerVersionOffset': 75
            });
        return preparedTx.txJSON;
    }

    // xrp 전송하기
    // Step 3 : Submit the Signed Blob
    // Step2 에서 만들어진 tx_blob 파일을 전송한다.
    this.doSubmit = async function(txBlob) {
        const latestLedgerVersion = await this.api.getLedgerVersion();
        const result = await this.api.submit(txBlob)
        return {result, latestLedgerVersion: latestLedgerVersion + 1}
    };

    /**
     *
     */
    this.payment = async function(from, to, tag, amount, secret, callback) {
        const txJSON = await this.doPrepare(from, to, tag, amount);

        // Step 2 : Sign the Transaction Instructions
        try {
            const response = await this.api.sign(txJSON, secret);

            const tx_blob = response.signedTransaction;

            const submitResult = await this.doSubmit(tx_blob);

            if (submitResult.result.engine_result_code === 0) {
                const param = {from, to, amount: (amount), txid: response.id};
                callback(null, param);
            } else {
                callback(submitResult);
            }

        } catch (e) {
            console.log('catch error: ', e);
            callback(e)
        }
    }

} // Ripple(io)

Ripple.prototype = {};
/**
 * front 에서 address 생성 호출이 들어 오면 실행한다.
 * @Deprecated ripple addresss 는 하나의 주소만 처리한다.
 */
Ripple.prototype.generateAddress = function(user, callback) {
    const generated = this.api.generateAddress();
};

module.exports = Ripple;
