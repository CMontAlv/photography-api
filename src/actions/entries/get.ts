import { handler } from '../../libs/handler-lib';
import { dynamoDb } from '../../libs/dynamodb-lib';

export const main = handler(async (event) => {
    const params = {
        TableName: process.env.entriesTableName,
        Key: {
            userId: event.requestContext.identity.cognitoIdentityId,
            entryId: event.pathParameters.id,
        },
    };

    const result = await dynamoDb.get(params);
    if (!result.Item) {
        throw new Error('Item not found.');
    }

    // Return the retrieved item
    return result.Item;
});
