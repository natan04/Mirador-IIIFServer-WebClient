function DocImage() {
    var _imgData = 0;
    this.src = '';
    this.width = 0;
    this.height = 0;
    this.mode = 'rgb';

    var _self = this;


    this.load = function (src, callback) {
        this.src = src;

        var img = new Image();
        img.onload = function () {
            _self.imageLoaded(img, callback);
        };
        img.src = src;
    }

    this.imageLoaded = function (img, callback) {
        this.width = img.width;
        this.height = img.height;
        var docCanvas = $('<canvas></canvas>').get(0);
        docCanvas.width = img.width;
        docCanvas.height = img.height;
        var ctx = docCanvas.getContext("2d");
        ctx.drawImage(img, 1, 1);
        var imageData = ctx.getImageData(0, 0, docCanvas.width, docCanvas.height);
        this._imgData = imageData.data;
        // only supported mode for now
        this.setColorMode('grayscale');
        callback();
    }


    this.setColorMode = function (colorMode) {
        if (colorMode == 'grayscale') {
            this._colorMode = 'grayscale';
            //        this._imgData = 
            var origData = this._imgData;
            var newData = new Uint8Array(origData.length / 4);

            for (var y = 0; y < this.height; y++) {
                for (var x = 0; x < this.width; x++) {
                    var idx = (y * this.width * 4) + x * 4;
                    var newPixVal = (origData[idx] + origData[idx] + origData[idx])/3;
                    newData[(y * this.width) + x] = Math.round(newPixVal);
                }
            }
            this._imgData = newData;
        }
        else {
            //TODO: exception
        }
    }

    this.pixval = function (x, y) {
        return this._imgData[(this.width * y) + x];
    }

    this.setpixval = function (x, y, val) {
        this._imgData[(this.width * y) + x] = val;
    }

    this.getComponentBB = function (startX, startY, threshold) {
        var fromX = startX, toX = startX, fromY = startY, toY = startY;
        var runTimeProtection = 1500;
        var startTime = new Date().getTime();
        var checked = new relative2DArray({X:startX,Y:startY});
        var stack = new Array();

        stack.push([startX, startY]);

        while (stack.length > 0) {
            pix = stack.pop();
            var x = pix[0];
            var y = pix[1];
            checked.set(x, pix[1], 1);
            if (this.pixval(x, y) < threshold) {
                if (x < fromX) fromX = x;
                if (x > toX) toX = x;
                if (y < fromY) fromY = y;
                if (y > toY) toY = y;

                if (checked.get(x - 1, y) == 0) stack.push([x - 1, y]);
                if (checked.get(x + 1, y) == 0) stack.push([x + 1, y]);
                if (checked.get(x, y - 1) == 0) stack.push([x, y - 1]);
                if (checked.get(x, y + 1) == 0) stack.push([x, y + 1]);
            }
            if ((new Date().getTime() - startTime) > runTimeProtection) {
                message('computation aborted.');
                break;
            }
        }

        return {
            X: fromX,
            Y: fromY,
            Width: toX - fromX,
            Height: toY - fromY

        };
    }

    this.drawLine = function (fromX, fromY, toX, toY, color) {
        if (color == 'black')
            color = 0;
        else if (color == 'white')
            color = 255;
        //else throw ('color not supported');

        var x = fromX, y = fromY;
        var steps = Math.max(Math.abs(toX - fromX), Math.abs(toY - fromY));
        if (steps == 0) return;
        var xStep = (toX - fromX) / steps;
        var yStep = (toY - fromY) / steps;

        for (; steps > 0; steps--) {
            x += xStep;
            y += yStep;
            this.setpixval(Math.floor(x), Math.floor(y), color);
            this.setpixval(Math.floor(x), Math.floor(y)+1, color);
        }
    }

    this.findSeedForSeperatingLine = function (fromX, fromY, toX, toY, centerOfOrigin) {
        var distFromLine = 5;
        var normal = { Y: toX - fromX, X: -(toY - fromY) };
        var normalInitialLen = Math.sqrt(normal.X * normal.X + normal.Y * normal.Y);
        normal.X = Math.round(normal.X * distFromLine / normalInitialLen);
        normal.Y = Math.round(normal.Y * distFromLine / normalInitialLen);

        var startPlusNormal = { X: (fromX + normal.X), Y: (fromY + normal.Y) };
        var startMinsNormal = { X: (fromX - normal.X), Y: (fromY - normal.Y) };
        var distPlus = this.getDist(startPlusNormal, centerOfOrigin);
        var distMinus = this.getDist(startMinsNormal, centerOfOrigin);

        if (distPlus < distMinus)
            normal = { X: -normal.X, Y: -normal.Y };

        var minPt = { X: fromX + normal.X, Y: fromY + normal.Y };
        var minVal = this.pixval(minPt.X, minPt.Y);

        var x = fromX, y = fromY;
        var steps = Math.max(Math.abs(toX - fromX), Math.abs(toY - fromY));
        if (steps == 0) return;
        var xStep = (toX - fromX) / steps;
        var yStep = (toY - fromY) / steps;

        for (; steps > 0; steps--) {
            x += xStep;
            y += yStep;
            var intX = Math.floor(x);
            var intY = Math.floor(y);

            if (this.pixval(intX + normal.X, intY + normal.Y) < minVal) {
                minPt.X = intX + normal.X;
                minPt.Y = intY + normal.Y;
                minVal = this.pixval(minPt.X, minPt.Y);
            }

        }

        return minPt;
    }

    this.draw = function (inElement) {
        var canvas = $('<canvas></canvas>').get(0);
        canvas.width = this.width;
        canvas.height = this.height;
        inElement.append(canvas);
        var ctx = canvas.getContext("2d");

        var imgData = ctx.createImageData(canvas.width, canvas.height);

        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                var val = this._imgData[x+(y*this.width)];
                imgData.data[0 + (x * 4) + (y * 4 * canvas.width)] = val;
                imgData.data[1 + (x * 4) + (y * 4 * canvas.width)] = val;
                imgData.data[2 + (x * 4) + (y * 4 * canvas.width)] = val;
                imgData.data[3 + (x * 4) + (y * 4 * canvas.width)] = 255;
            }
        }
        //        imgData.data = tmp;
        var intArr = new Uint8Array(10);
        ctx.putImageData(imgData, 0, 0);
        //ctx.fillRect(0, 0, 150, 100);
    }

    this.getDist = function (pointA, pointB) {
        var xDist = pointA.X- pointB.X;
        var yDist = pointA.Y - pointB.Y;
        return Math.sqrt(xDist*xDist+yDist*yDist);
    }
}