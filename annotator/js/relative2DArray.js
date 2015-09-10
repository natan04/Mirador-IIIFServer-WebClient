function relative2DArray(basePoint) {
    var _array = new Array();
    var _basePoint = basePoint;

    function getIndex(x, y) {
        x = x- _basePoint.X;
        y = y- _basePoint.Y;
        var sqr = Math.max(Math.abs(x), Math.abs(y));
        var sqrStartInd = (sqr * 2 - 1)*(sqr * 2 - 1);
        var idxInSqr = 0;
        if (sqrStartInd < 0) sqrStartInd = 0;

        if (y == -sqr) idxInSqr = sqr - x;
        else if (x == sqr) idxInSqr = (2 * sqr) + (sqr + y);
        else if (y == sqr) idxInSqr = (4 * sqr) + (sqr - x);
        else if (x == -sqr) idxInSqr = (6 * sqr) + (sqr - y);

        return sqrStartInd + idxInSqr;
    }

    this.get = function (x, y) {
        var idx = getIndex(x, y);
        if (_array[idx] == undefined)
            return 0;
        else
            return _array[idx];
    }

    this.set = function (x, y, val) {
        var idx = getIndex(x, y);
        _array[idx] = val;
    }

    
}