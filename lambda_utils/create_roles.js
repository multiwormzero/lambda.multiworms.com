//create aws iam role named 'wms_lambda_role' with the following policy attached wms_dynamo_db and AWSLambdaBasicExecutionRole

import { IAMClient, CreateRoleCommand, AttachRolePolicyCommand } from "@aws-sdk/client-iam";
const client = new IAMClient({ region: 'us-east-2' });

async function createLambdaRole() {
    const assumeRolePolicy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "Service": "lambda.amazonaws.com"
                },
                "Action": "sts:AssumeRole"
            }
        ]
    };

    const params = {
        RoleName: 'wms_lambda_role',
        AssumeRolePolicyDocument: JSON.stringify(assumeRolePolicy),
        Description: 'Role to give lambda function access to dynamoDB',
    };

    try {
        const command = new CreateRoleCommand(params);
        const response = await client.send(command);
        console.log('Role created successfully', response);

        const attachParams = {
            PolicyArn: 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
            RoleName: 'wms_lambda_role',
        };
        const attachCommand = new AttachRolePolicyCommand(attachParams);
        const attachResponse = await client.send(attachCommand);
        console.log('Policy attached successfully', attachResponse);

        const attachParams2 = {
            PolicyArn: 'arn:aws:iam::471112954417:policy/wms_dynamo_db',
            RoleName: 'wms_lambda_role',
        };
        const attachCommand2 = new AttachRolePolicyCommand(attachParams2);
        const attachResponse2 = await client.send(attachCommand2);
        console.log('Policy attached successfully', attachResponse2);
        
        const attachParams3 = {
            PolicyArn: 'arn:aws:iam::aws:policy/AWSBillingReadOnlyAccess',
            RoleName: 'wms_lambda_role',
        };

        const attachCommand3 = new AttachRolePolicyCommand(attachParams3);
        const attachResponse3 = await client.send(attachCommand3);
        console.log('Policy attached successfully', attachResponse3);
        
    } catch (error) {
        console.error('Error creating role', error);
    }
}

createLambdaRole();