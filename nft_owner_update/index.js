import { DynamoDBClient, ScanCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import Web3 from 'web3';
import crypto from 'node:crypto';

const ddb = new DynamoDBClient({region:'us-east-2'});

async function getProjectLatestBlock (ddb, contractId) {
    let lastBlock;
    const params = {
      "TableName": "projects",
      "ConsistentRead": true,
      "FilterExpression": "#CA = :CA",
      "ExpressionAttributeValues": {
        ":CA": {
          "S": `${contractId}`
        }
      },
      "ExpressionAttributeNames": {
        "#CA": "contract_address"
      }
    };

    // Call DynamoDB's scan API
    try {
        const scan = new ScanCommand(params);
        const data =  await ddb.send(scan);

        if (data.Items.length === 0) {
            return 0;
        }

        lastBlock = data.Items[0].last_transaction_block.N;
        
        return lastBlock;

    } catch (err) {
        console.log(err);
    }
}

async function getProjectAddresses (ddb) {
    let addresses = [];
    const params = {
      "TableName": "projects",
      "ConsistentRead": true,
      "ProjectionExpression": "contract_address",
      "ExpressionAttributeNames": {
        "#A": "active"
      },
      "ExpressionAttributeValues": {
        ":active": {
          "N": "1" // 1 is active, 0 is inactive
        }
      },
      "FilterExpression": "#A = :active",
    };

    // Call DynamoDB's scan API
    try {
        const scan = new ScanCommand(params);
        const data =  await ddb.send(scan);

        if (data.Items.length === 0) {
            return [];
        }

        data.Items.forEach(item => {
            addresses.push(item.contract_address.S);
        });

        return addresses;

    } catch (err) {
        console.log(err);
    }
}

async function updateNFTOwner (ddb, partitionKey, owner) {
    const updateParams = {
        "TableName": "nfts",
        "Key": {
          "partitionKey": {
            "S": ""
          }
        },
        "UpdateExpression": "SET #Owner = :Owner",
        "ExpressionAttributeValues": {
          ":Owner": {
            "S": ""
          }
        },
        "ExpressionAttributeNames": {
          "#Owner": "owner"
        }
      }

      updateParams.Key.partitionKey.S = partitionKey;
      updateParams.ExpressionAttributeValues[':Owner'].S = owner;

      const updateCommand = new UpdateItemCommand(updateParams);
      
      try {
        const res = await ddb.send(updateCommand);
      } catch (err) {
        console.log('NFT Update Error: '+err);
      }
}

async function updateProjectLastBlock (ddb, contractId, lastBlock) {
    const updateParams = {
        "TableName": "projects",
        "Key": {
          "contract_address": {
            "S": ""
          }
        },
        "UpdateExpression": "SET #Block = :Block",
        "ExpressionAttributeValues": {
          ":Block": {
            "N": ""
          }
        },
        "ExpressionAttributeNames": {
          "#Block": "last_transaction_block"
        }
      }

      updateParams.Key.contract_address.S = contractId;
      updateParams.ExpressionAttributeValues[':Block'].N = String(lastBlock);

      const updateCommand = new UpdateItemCommand(updateParams);
      const response = await ddb.send(updateCommand);
}

async function getTransactions (ddb, contractId) {
    
    const web3 = new Web3('https://rpc.mtv.ac');
    const lastBlock = await getProjectLatestBlock(ddb, contractId);
    let partitionKey, owner;
    let maxBlock = 0;
    const nft_owners = {};
    //console.log('Last Block: '+ lastBlock);

    const res = await web3.eth.getPastLogs({fromBlock: Number(lastBlock), address: contractId, topics:['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef']});

    let count = 0;

    res.forEach(rec => {
        partitionKey = crypto.createHash('md5').update(contractId+web3.eth.abi.decodeParameter('uint256',rec.topics[3])).digest('hex');
        owner = web3.utils.toChecksumAddress(rec.topics[2].replace('0x000000000000000000000000', '0x'));

        nft_owners[partitionKey] = owner;

        maxBlock = maxBlock < rec.blockNumber? rec.blockNumber:maxBlock;
    });

    console.log('Owners to update: '+Object.keys(nft_owners).length);

    for (let key in nft_owners) {
        updateNFTOwner(ddb, key, nft_owners[key]);
    }

    if (maxBlock > 0) {
        updateProjectLastBlock(ddb, contractId, maxBlock+1n);
    }
    
    return maxBlock;    
}


export const handler = async (event, context) => {
  const data = await getProjectAddresses(ddb);
  for (let i = 0; i < data.length; i++) {
      //console.log('Processing: '+data[i]);
      await getTransactions(ddb, data[i]);
  } 
};


// Get all project addresses and process transactions
// const data = await getProjectAddresses(ddb);
// for (let i = 0; i < data.length; i++) {
//     console.log('Processing: '+data[i]);
//     await getTransactions(ddb, data[i]);
// }