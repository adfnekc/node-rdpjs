const Jimp = require('jimp');

module.exports = class Screen {
    constructor(size) {
        size.width = size.width || 800;
        size.height = size.height || 600;

        this.size = size;
        this.partialImage = null;
        this.image = null;

        new Jimp(64, 64, (err, newImage) => {
            this.partialImage = newImage;
            if (err) {
                console.error(err);
            }
        });
        new Jimp(this.size.width, this.size.height, (err, newImage) => {
            this.image = newImage;
            if (err) {
                console.error(err);
            }
        });
    }

    /**
    * write the current image to disk
    * @param filename - file name to write to
    */
    async toFileAsync(filename) {
        await this.image.writeAsync(filename);
    }

    async toBase64Async() {
        return await this.image.getBase64Async(this.image.getMIME());
    }

    /**
     * @param cb: GenericCallback<string, any, this>
     */
    toBase64(cb) {
        return this.image.getBase64(this.image.getMIME(), cb)
    }

    /**
     * update canvas with new bitmap
     * @param bitmap {object}
     */
    update(bitmap) {
        this.partialImage.bitmap.width = bitmap.width;
        this.partialImage.bitmap.height = bitmap.height;
        this.partialImage.bitmap.data = new Uint8ClampedArray(bitmap.data);

        this.image.composite(this.partialImage, bitmap.destLeft, bitmap.destTop);
    }
}