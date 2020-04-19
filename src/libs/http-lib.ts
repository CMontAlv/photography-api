import * as http from 'http';
import { URL } from 'url';

const httpRequest = (url, params: http.RequestOptions) => {
    const parsedUrl = new URL(url);

    const options = {
        ...params,
        protocol: parsedUrl.protocol,
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname,
    };

    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            resolve(res);
        });

        req.on('error', (e) => {
            reject(e.message);
        });
    });
};

const httpGet = async (url, params) => {
    const options = {
        ...params,
        method: 'GET',
    };
    return httpRequest(url, options);
};

const httpPost = async (url, params) => {
    const options = {
        ...params,
        method: 'POST',
    };
    return httpRequest(url, options);
};

const httpPut = async (url, params) => {
    const options = {
        ...params,
        method: 'PUT',
    };
    return httpRequest(url, options);
};

const httpDelete = async (url, params) => {
    const options = {
        ...params,
        method: 'DELETE',
    };
    return httpRequest(url, options);
};

export const httpLib = {
    get: httpGet,
    post: httpPost,
    put: httpPut,
    delete: httpDelete,
};
