import * as uuid from 'uuid';

import { handler } from '../../libs/handler-lib';
import { dynamoDb } from '../../libs/dynamodb-lib';

export const main = handler(async (event, context) => {
    const data = JSON.parse(event.body);
    const params = {
        TableName: process.env.entriesTableName,
        Item: {
            userId: event.requestContext.identity.cognitoIdentityId,
            entryId: uuid.v1(),
            content: data.content,
            photoKey: data.photoKey,
            createdAt: Date.now(),
        },
    };

    await dynamoDb.put(params);

    return params.Item;
});
