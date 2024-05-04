//import { DynamoDBClient, ScanCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import Web3, { utils } from 'web3';
import crypto from 'node:crypto';
import { get } from 'node:http';


async function getTransactions (startBlock, contractId) {
    
    const web3 = new Web3('https://rpc.mtv.ac');
    const lastBlock = startBlock;
    let partitionKey, owner;
    let maxBlock = 0;
    const nft_owners = {};
    let accounts = [];
    //console.log('Last Block: '+ lastBlock);

    const res = await web3.eth.getPastLogs({fromBlock: Number(lastBlock), address: contractId, topics:['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef']});

    let count = 0;

    // res.forEach(rec => {
    //     partitionKey = crypto.createHash('md5').update(contractId+web3.eth.abi.decodeParameter('uint256',rec.topics[3])).digest('hex');
    //     owner = web3.utils.toChecksumAddress(rec.topics[2].replace('0x000000000000000000000000', '0x'));

    //     nft_owners[partitionKey] = owner;

    //     maxBlock = maxBlock < rec.blockNumber? rec.blockNumber:maxBlock;
    // });

    //console.log('Owners to update: '+Object.keys(nft_owners).length);
    console.log('transaction count: '+res.length);
    console.log('first transaction: '+res[0].transactionHash);
    console.log('last transaction: '+res[res.length-100].transactionHash);

    // getTransaction(res[0].transactionHash, accounts);

    // console.log(accounts);  

}

async function getTransaction (txHash, accounts) {
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex
    const web3 = new Web3('https://rpc.mtv.ac');

    try {
        const tx = await web3.eth.getTransaction(txHash);
        console.log(tx);
        accounts.push({ 'txHash': tx.hash, 'toAddress': '0x'+tx.data.substring(34,74), 'fromAddress': tx.from, 'amount': BigInt('0x'+ tx.data.substring(74,138)) });
    } catch (error) {
        console.log(`Error: (${txHash}) `+error);
    }

}

//getTransactions(0, '0x2Eb19Db032dC60039d35E36918d33197D9F7D7b9');

async function getTransfers () {
    const accounts = [];

    await getTransaction('0xeb81aba3c4576d1ec78efa88bd19ccc22c360c097591779315658078a99d0997', accounts); //0xeb81aba3c4576d1ec78efa88bd19ccc22c360c097591779315658078a99d0997//0x2bcc4ad9aee4904e598885d633c3fbc2512d351c2ea3ca2d4cb0d60f27323e14

    console.log(accounts);

}

getTransfers();