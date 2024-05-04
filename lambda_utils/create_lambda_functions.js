import { LambdaClient, CreateFunctionCommand, AddPermissionCommand, CreateEventSourceMappingCommand } from "@aws-sdk/client-lambda";
import { EventBridgeClient, PutRuleCommand } from "@aws-sdk/client-eventbridge";
import { readFile } from 'fs/promises';
const lambdaClient = new LambdaClient({ region: 'us-east-2' });
const eventBridgeClient = new EventBridgeClient({ region: 'us-east-2' });

async function createOwnerUpdateFunction() {
    const file = await readFile('lambda_hello_world.zip');

    const params = {
        FunctionName: 'wms_owner_update',
        Runtime: 'nodejs18.x',
        Role: 'arn:aws:iam::471112954417:role/wms_lambda_role',
        Handler: 'index.handler',
        Description: 'Lambda function to update owner of a project',
        Timeout: 30,
        Publish: true,
        Code: {
            ZipFile: file,
        },
    };

    try {
        const command = new CreateFunctionCommand(params);
        const response = await lambdaClient.send(command);
        console.log('Lambda function created successfully', response);

        const permissionParams = {
            Action: 'lambda:InvokeFunction',
            FunctionName: 'wms_owner_update',
            Principal: 'apigateway.amazonaws.com',
            StatementId: 'wms_owner_update',
            SourceAccount: '471112954417',
        };
        const permissionCommand = new AddPermissionCommand(permissionParams);
        const permissionResponse = await lambdaClient.send(permissionCommand);
        console.log('Permission added successfully', permissionResponse);
    } catch (error) {
        console.error('Error creating lambda function', error);
    }
}

async function createCostUpdateFunction() {
    const file = await readFile('lambda_hello_world.zip');

    const params = {
        FunctionName: 'wms_cost_update',
        Runtime: 'nodejs18.x',
        Role: 'arn:aws:iam::471112954417:role/wms_lambda_role',
        Handler: 'index.handler',
        Description: 'Lambda function to update the monthly cost of the site',
        Timeout: 30,
        Publish: true,
        Code: {
            ZipFile: file,
        },
    };

    try {
        const command = new CreateFunctionCommand(params);
        const response = await lambdaClient.send(command);
        console.log('Lambda function created successfully', response);

        const permissionParams = {
            Action: 'lambda:InvokeFunction',
            FunctionName: 'wms_cost_update',
            Principal: 'apigateway.amazonaws.com',
            StatementId: 'wms_cost_update',
            SourceAccount: '471112954417',
        };
        const permissionCommand = new AddPermissionCommand(permissionParams);
        const permissionResponse = await lambdaClient.send(permissionCommand);
        console.log('Permission added successfully', permissionResponse);
    } catch (error) {
        console.error('Error creating lambda function', error);
    }
}

// Create function that creates a new aws event-bridge rule named every-minute that runs every minute
async function createEventBridgeRuleOneMinute() {
    const params = {
        Name: 'every-minute',
        ScheduleExpression: 'rate(1 minute)',
    };

    try {
        const command = new PutRuleCommand(params);
        const response = await eventBridgeClient.send(command);
        console.log('EventBridge rule created successfully', response);
    } catch (error) {
        console.error('Error creating EventBridge rule', error);
    }
}

// Create function that creates a new aws event-bridge rule named once-a-day that runs once a day
async function createEventBridgeRuleOneDay() {
    const params = {
        Name: 'once-a-day',
        ScheduleExpression: 'cron(0 3 * * ? *)',
    };

    try {
        const command = new PutRuleCommand(params);
        const response = await eventBridgeClient.send(command);
        console.log('EventBridge rule created successfully', response);
    } catch (error) {
        console.error('Error creating EventBridge rule', error);
    }
}

async function createGetRandomNFT() {
    const file = await readFile('lambda_hello_world.zip');

    const params = {
        FunctionName: 'wms_get_random_nft',
        Runtime: 'nodejs18.x',
        Role: 'arn:aws:iam::471112954417:role/wms_lambda_role',
        Handler: 'index.handler',
        Description: 'Lambda function get a random NFT from the nfts table',
        Timeout: 30,
        Publish: true,
        Code: {
            ZipFile: file,
        },
    };

    try {
        const command = new CreateFunctionCommand(params);
        const response = await lambdaClient.send(command);
        console.log('Lambda function created successfully', response);

        const permissionParams = {
            Action: 'lambda:InvokeFunction',
            FunctionName: 'wms_get_random_nft',
            Principal: 'apigateway.amazonaws.com',
            StatementId: 'wms_get_random_nft',
            SourceAccount: '471112954417',
        };
        const permissionCommand = new AddPermissionCommand(permissionParams);
        const permissionResponse = await lambdaClient.send(permissionCommand);
        console.log('Permission added successfully', permissionResponse);
    } catch (error) {
        console.error('Error creating lambda function', error);
    }
}

// Create Lambda Functions
//createOwnerUpdateFunction();
//createCostUpdateFunction();
createGetRandomNFT();

// Create EventBridge Rules
//createEventBridgeRuleOneMinute();
//createEventBridgeRuleOneDay();

/* After creating the lambda function and event-bridge rule you will have to manually add the event-bridge target to the lambda function
**
** 1. Open the AWS Management Console and navigate to the Lambda console.
** 2. Choose the lambda function you created.
** 3. In the Designer section, choose Add trigger.
** 4. In the Trigger configuration section, choose EventBridge (CloudWatch Events).
** 5. In the Configure triggers section, choose the EventBridge rule you created.
** 6. Choose Add.
**
** You will also need to uploded the lambda code you want to use in the lambda functions or edit this script to use the most current code in a zip file.
*/