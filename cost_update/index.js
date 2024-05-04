import { CostExplorerClient, GetCostAndUsageCommand } from "@aws-sdk/client-cost-explorer"; // ES Modules import
import { DynamoDBClient, GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import date from 'date-and-time';
const client = new CostExplorerClient('us-west-2');
const dbclient = new DynamoDBClient('us-west-2');

async function getCost(monthOffset) {
    const now = new Date();
    const endDate = date.format(date.addMonths(now, (monthOffset*-1)+1), 'YYYY-MM-'+'01');
    const startDate = date.format(date.addMonths(now, monthOffset*-1), 'YYYY-MM-'+'01');

    const params = {
        TimePeriod: {
            Start: startDate,
            End: endDate,
        },
        Granularity: "MONTHLY",
        Metrics: ["BlendedCost"],
    };
    const command = new GetCostAndUsageCommand(params);
    const response = await client.send(command);
    return response;
}

// Check site_cost dynamoDB table for the current month's cost
async function getCurrentSiteCost(monthOffset) {
    let billingMonth = date.format(date.addMonths(new Date(), monthOffset*-1), 'YYYYMM');
    let returnvalue;

    // Check if the cost is present in the table
    const params = {
        TableName: 'site_cost',
        Key: {
            'month': {N: billingMonth},
        },
    };

    const command = new GetItemCommand(params);
    const response = await dbclient.send(command);
    if (response.Item) {
        returnvalue = true;
    } else {
        returnvalue = false;
    }
    return returnvalue;
}

// Put the cost into the site_cost dynamoDB table
async function putCost(monthOffset, cost) {
    let billingMonth = date.format(date.addMonths(new Date(), monthOffset*-1), 'YYYYMM');

    const params = {
        TableName: 'site_cost',
        Item: {
            'month': {N: billingMonth},
            'cost': {N: cost},
        },
    };

    const command = new PutItemCommand(params);
    const response = await dbclient.send(command);
    return response;
}

//getCost().then((data) => console.log(data.ResultsByTime[0].Total.BlendedCost.Amount));
//getCurrentSiteCost('202403').then((data) => console.log(data));

export const handler = async (event) => {
    let monthOffset = 1;
    let billingMonth = date.format(date.addMonths(new Date(), monthOffset*-1), 'YYYYMM');

    if (await getCurrentSiteCost(monthOffset)) {
        console.log('Cost is already present in the table');
    } else {
        console.log('Cost is not present in the table');
        const cost = await getCost(monthOffset);
        console.log(cost.ResultsByTime[0].Total.BlendedCost.Amount);
        await putCost(monthOffset, cost.ResultsByTime[0].Total.BlendedCost.Amount);
    }
}

//handler();