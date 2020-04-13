import sharp from 'sharp';

import handler from '../../libs/handler-lib';
import { s3 } from '../../libs/s3-lib';

const processEvent = (event) => {
    const srcBucket = event.Records[0].s3.bucket.name;
    // Object key may have spaces or unicode non-ASCII characters.
    const srcKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

    return {
        srcBucket,
        srcKey,
    };
};

const isTypeSupported = (srcKey) => {
    // Infer the image type from the file suffix.
    const typeMatch = srcKey.match(/\.([^.]*)$/);

    if (!typeMatch) {
        console.log('Could not determine the image type.');
        return false;
    }

    // Check that the image type is supported
    const imageType = typeMatch[1].toLowerCase();
    if (imageType != 'jpg' && imageType != 'png') {
        console.log(`Unsupported image type: ${imageType}`);
        return false;
    }

    return true;
};

export const main = handler(async (event, context, callback) => {
    const { srcBucket, srcKey } = processEvent(event);

    if (!isTypeSupported(srcKey)) {
        return throw new Error('Non supported file type');
    }

    const targetBucket = process.env.proccessedPhotoBucket;
    const targetKey = 'resized-' + srcKey;

    const photoParams = {
        Bucket: srcBucket,
        Key: srcKey,
    };

    const photo = await s3.get(photoParams);

    const resizeWidth = 200;
    const resizedPhoto = await sharp(photo.Body).resize(resizeWidth).toBuffer();

    const destparams = {
        Bucket: targetBucket,
        Key: targetKey,
        Body: resizedPhoto,
        ContentType: 'image',
    };

    const putResult = await s3.put(destparams);

    return putResult;
});
