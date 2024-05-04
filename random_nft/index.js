import { DynamoDBClient, ScanCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { createHash } from 'crypto';

const client = new DynamoDBClient({ region: "us-east-2" });

async function getProjects() {
    const params = {
        ExpressionAttributeNames: {
            "#a": "active",
        },
        ExpressionAttributeValues: {
            ":a": { N: "1" },
        },

        FilterExpression: "#a = :a",

        TableName: "projects",
    };
    const command = new ScanCommand(params);
    const response = await client.send(command);
    return response.Items;
}

async function getNFT(contractId,tokenId) {
    let response
    let tokens = [];
    const pk = createHash('md5').update(contractId+tokenId).digest('hex');

    const params = {

        Key: {
            "partitionKey": { S: `${pk}` },
        },
        TableName: "nfts",
    };

    const command = new GetItemCommand(params);

    try {
        response = await client.send(command);
    } catch (err) {
        console.log(err);
    }

    return response.Item;

}

export const handler = async (event) => {
    const projects = await getProjects();
    let selectedProject;
    let randomIndex;
    let tokens = [];
    
    if (projects.length === 0) {
        return {
            statusCode: 404,
            body: JSON.stringify({ message: "No projects found" }),
        };
    } else {
        for (let i = 0; i < 20; i++) {
            randomIndex = Math.floor(Math.random() * projects.length);
            selectedProject = projects[randomIndex];
            randomIndex = Math.floor(Math.random() * Number(selectedProject.number_of_items.N)) + Number(selectedProject.index_number.N);
            tokens.push(await getNFT(selectedProject.contract_address.S, randomIndex));
            
        }
        
        return tokens;
    }
};

console.log(await handler());

