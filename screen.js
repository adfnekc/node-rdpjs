const Jimp = require('jimp');

/**
 * create the canvas to right the screen updates to
 * @param size {object} - object with height and width of the screen
 */
function create(size) {
    return new Promise((resolve, reject) => {
        new Jimp(32, 32, function (err, pImage) {
            partialImage = pImage;
            if (err) {
                console.error(err);
                reject(err);
            } else {
                new Jimp(size.width, size.height, function (err2, newImage) {
                    image = newImage;
                    if (err) {
                        console.error(err2);
                        reject(err2);
                    } else {
                        resolve();
                    }
                });
            }
        });
    });
};
/**
 * update canvas with new bitmap
 * @param bitmap {object}
 */
function update(bitmap) {
    var output = {
        width: bitmap.width,
        height: bitmap.height,
        data: new Uint8ClampedArray(bitmap.data)
    };

    if (partialImage) {
        partialImage.bitmap.width = output.width;
        partialImage.bitmap.height = output.height;
        partialImage.bitmap.data = output.data;
        image.composite(partialImage, bitmap.destLeft, bitmap.destTop);
    }
}

/**
 * write the current image to disk
 * @param filename - file name to write to
 */
function write(filename) {
    image.write(filename);
}




module.exports = class Screen {
    constructor(size) {
        size.width = size.width || 800;
        size.height = size.height || 600;

        this.size = size;
        this.partialImage = null;
        this.image = null;
        this.debug = 0
    }

    async init() {
        let that = this
        await new Jimp(64, 64, function (err, newImage) {
            that.partialImage = newImage;
            if (err) {
                console.error(err);
            }
        });
        await new Jimp(that.size.width, that.size.height, function (err, newImage) {
            that.image = newImage;
            if (err) {
                console.error(err);
            }
        });
        return this;
    }

    /**
    * write the current image to disk
    * @param filename - file name to write to
    */
    async toFileAsync(filename) {
        await this.image.writeAsync(filename);
    }

    async toBase64Async(){
        return await this.image.getBase64Async(this.image.getMIME());
    }

    /**
     * @param cb: GenericCallback<string, any, this>
     */
    toBase64(cb){
        return this.image.getBase64(this.image.getMIME(),cb)
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
        //this.image.write(`debug/${this.debug++}.png`);
    }
}