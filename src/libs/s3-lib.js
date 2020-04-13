import AWS from 'aws-sdk';

const storage = new AWS.S3();

export const s3 = {
    get: (params) => storage.getObject(params).promise(),
    put: (params) => storage.putObject(params).promise(),
};
