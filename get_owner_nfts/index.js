import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { isAddress } from "web3-validator"; 

const client = new DynamoDBClient({ region: "us-east-2" });

async function scanTable(owner, contractId) {
    let result = [];
    let data;

    const params = {
        ExpressionAttributeNames: {
            },
        ExpressionAttributeValues: {
        },
    
        TableName: "nfts",
      }

    if (owner) {
        params.ExpressionAttributeNames["#O"] = "owner";
        params.ExpressionAttributeValues[":o"] = {
            S: owner,
        };
        params.FilterExpression = "#O = :o";
    }

    if (contractId) {
        params.ExpressionAttributeNames["#C"] = "contractId";
        params.ExpressionAttributeValues[":c"] = {
            S: contractId,
        };

        if (params.FilterExpression) {
            params.FilterExpression += " AND #C = :c";
        } else {
            params.FilterExpression = "#C = :c";
        }
    }

    const command = new ScanCommand(params);

    try {
        do
        {
            data = await client.send(command);
            data.Items.forEach((element, index, array) => {
                result.push(element);
            });
            params.ExclusiveStartKey = data.LastEvaluatedKey;
        } while (data.LastEvaluatedKey);
    } catch (err) {
    console.error(err);
    }
    return result;
}

export const handler = async (event, context) => {
    let owner = event.owner;
    let contractId = event.contractId;

    if (owner && !isAddress(owner)) {
        return "Invalid owner or contract address";
    }

    if (contractId && !isAddress(contractId)) {
        return "Invalid owner or contract address";
    }

    let result = await scanTable(owner, contractId);
    return result;
  };
  
//handler({owner: "0x861AA33Bc06261F8eE3Ec09B5700e4020191923d",contractId: "0x4551C11B22FDd733A0328c62d6eF4e4C6496DadA"}, null).then((result) => { console.log(result.length); });