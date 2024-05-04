import { APIGatewayClient, CreateRestApiCommand, CreateResourceCommand } from "@aws-sdk/client-api-gateway";

async function createRestApi() {
  const client = new APIGatewayClient({ region: "us-east-2" });
  const command = new CreateRestApiCommand({
    name: "multiworms",
    binaryMediaTypes: ['*'],
    endpointConfiguration: {
        types: ['REGIONAL']
    }
    });
    const response = await client.send(command);
    console.log(response);
}


//createRestApi();
