import Jimp from 'jimp';

import { handler } from '../../libs/handler-lib';
import { s3 } from '../../libs/s3-lib';

const processEvent = (event) => {
    const srcBucket = event.Records[0].s3.bucket.name;
    // Object key may have spaces or unicode non-ASCII characters.
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

    return {
        srcBucket,
        key,
    };
};

const isTypeSupported = (key) => {
    // Infer the image type from the file suffix.
    const typeMatch = key.match(/\.([^.]*)$/);

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

export const main = handler(async (event) => {
    const { srcBucket, key } = processEvent(event);

    if (!isTypeSupported(key)) {
        throw new Error('Non supported file type');
        return;
    }

    const targetBucket = process.env.proccessedPhotoBucket;

    const photoParams = {
        Bucket: srcBucket,
        Key: key,
    };

    const photo = await s3.get(photoParams);

    const resizeWidth = 200;
    // @ts-ignore
    const resizedPhoto = await Jimp.read(photo.Body)
        .then((image) => image.resize(resizeWidth, resizeWidth).quality(100).getBufferAsync(Jimp.MIME_JPEG))
        .catch((e) => e);

    const destparams = {
        Bucket: targetBucket,
        Key: key,
        Body: resizedPhoto,
        ContentType: 'image',
    };

    const putResult = await s3.put(destparams);

    return putResult;
});
