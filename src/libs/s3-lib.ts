import { S3 } from 'aws-sdk';

const storage = new S3();

export const s3 = {
    get: (params) => storage.getObject(params).promise(),
    put: (params) => storage.putObject(params).promise(),
};
