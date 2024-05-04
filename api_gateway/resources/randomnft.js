import { APIGatewayClient, CreateRestApiCommand, CreateResourceCommand } from "@aws-sdk/client-api-gateway";

async function createResource(pathPart) {
    const client = new APIGatewayClient({ region: "us-east-2" });
    const command = new CreateResourceCommand({
      restApiId: "5fqn2x2tmh",
      parentId: "k4168dlad4",
      pathPart: pathPart,
      resourceMethods: {
        "POST": {}
      }
    });

    const response = await client.send(command);
  
  }

  
  console.log(await createResource('randomnft'));