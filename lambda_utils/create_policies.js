//Create a policy called wms_dynamo_db that gives readd and write access to a dynamoDB table called 'nfts' and 'projects' to the lambda function.


import { IAMClient, CreatePolicyCommand } from "@aws-sdk/client-iam";
const client = new IAMClient({ region: 'us-east-2' });

async function createDDBPolicy() {
    const policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "dynamodb:GetItem",
                    "dynamodb:PutItem",
                    "dynamodb:UpdateItem",
                    "dynamodb:DeleteItem",
                    "dynamodb:Scan",
                    "dynamodb:Query"
                ],
                "Resource": [
                    "arn:aws:dynamodb:*:*:table/nfts",
                    "arn:aws:dynamodb:*:*:table/projects",
                    "arn:aws:dynamodb:*:*:table/site_cost"
                ]
            }
        ]
    };

    const params = {
        PolicyName: 'wms_dynamo_db',
        PolicyDocument: JSON.stringify(policy),
        Description: 'Policy to give read and write access to nfts and projects tables',
    };

    try {
        const command = new CreatePolicyCommand(params);
        const response = await client.send(command);
        console.log('Policy created successfully', response);
    } catch (error) {
        console.error('Error creating policy', error);
    }
}

createDDBPolicy();