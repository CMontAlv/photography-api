import Jimp from 'jimp';

import { handler } from '../../libs/handler-lib';
import { s3 } from '../../libs/s3-lib';

import { PHOTO_SIZES } from './constants';

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

const getResizedImagesArray = (image: Jimp, sizes: Array<number> = PHOTO_SIZES): Promise<Buffer>[] => {
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    const isLandscape = width > height;

    return sizes.map(async (size) => {
        const newWidth = isLandscape ? size : (width / height) * size;
        const newHeight = isLandscape ? (height / width) * size : size;

        return await image.resize(newWidth, newHeight).quality(100).getBufferAsync(Jimp.MIME_JPEG);
    });
};

const processPhoto = async (image: Buffer) => {
    const result = await Jimp.read(image)
        .then(getResizedImagesArray)
        .catch((e) => {
            console.log(e);
            throw new Error('Error processing photos');
        });

    return result;
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

    // @ts-ignore
    const resizedPhotos = await processPhoto(photo.Body);

    resizedPhotos.forEach(async (photo, index) => {
        const destparams = {
            Bucket: targetBucket,
            Key: `${key}-${PHOTO_SIZES[index]}`,
            Body: await photo,
            ContentType: 'image',
        };

        await s3.put(destparams);
    });

    return { status: 200 };
});
