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

    await dynamoDb.delete(params);

    return { status: 'Successfully deleted item' };
});
