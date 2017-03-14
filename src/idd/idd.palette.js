InteractiveDataDisplay = InteractiveDataDisplay || {};

// Represents a mapping from a number to a value (e.g. a color)
// The function color has an domain [min,max]. If type is absolute, min and max are arbitrary numbers such that max>min.
// If type is relative, min=0,max=1, and a user of the palette should normalize the values to that range.
// Argument of the color is normalized to the domain of the function
// palettePoints is an array of hslaColor.
InteractiveDataDisplay.ColorPalette = function (isNormalized, range, palettePoints) {

    var _isNormalized;
    var _range;
    var _points; // Structure: { x : number, leftColor? : string, rightColor? : string }
    var that = this;

    Object.defineProperty(this, "isNormalized", { get: function () { return _isNormalized; }, configurable: false });
    Object.defineProperty(this, "range", { get: function () { return _range; }, configurable: false });
    Object.defineProperty(this, "points", { get: function () { return _points; }, configurable: false });

    _isNormalized = isNormalized;
    if (_isNormalized) _range = { min: 0, max: 1 };
    else _range = { min: range.min, max: range.max };

    if (_range.min >= _range.max) throw "range is incorrect (min >= max)";

    if (palettePoints == undefined) throw "points are undefined";
    if (palettePoints.length < 2) throw "Palette should have at least two points";
    _points = palettePoints.slice(0);

    this.getRgba = function (value) {
        var hsla = that.getHsla(value);
        return InteractiveDataDisplay.ColorPalette.HSLtoRGB(hsla);
    }

    this.getHsla = function (value) {
        var n = _points.length;
        if (value <= _points[0].x) {
            return _points[0].leftColor;
        }
        else if (value >= _points[n - 1].x) {
            return _points[n - 1].rightColor;
        }

        var i1 = 0;
        var i2 = n - 1;
        while (i2 - i1 > 1) {
            var mid = Math.round((i1 + i2) / 2);
            if (_points[mid].x < value) i1 = mid;
            else i2 = mid;
        }
        var p1 = _points[i1];
        if (p1.x == value) i2 = i1;
        var p2 = _points[i2];

        // todo: optimize solid segments
        var alpha = (value - p1.x) / (p2.x - p1.x);

        var c1 = p1.rightColor; // hsla
        var c2 = p2.leftColor; // hsla

        if (c1.h == 0 && c1.s == 0) c1.h = c2.h;
        if (c2.h == 0 && c2.s == 0) c2.h = c1.h;
        
        var c1h = c1.h;
        var c2h = c2.h;

        if (Math.abs(c2h - c1h) > 3) {
            if (c1h < c2h) c1h += 6;
            else c2h += 6;
        }
        var c = {
            h: c1h + (c2h - c1h) * alpha,
            s: c1.s + (c2.s - c1.s) * alpha,
            l: c1.l + (c2.l - c1.l) * alpha,
            a: c1.a + (c2.a - c1.a) * alpha
        };

        if (c.h >= 6) c.h -= 6;
        return c;
    }

    this.absolute = function (min, max) {
        var n = _points.length;
        var k = (max - min) / (_range.max - _range.min);
        var points = new Array(n);
        for (var i = 0; i < n; i++) {
            var oldp = _points[i];
            points[i] = { x: k * (oldp.x - _range.min) + min, rightColor: oldp.rightColor, leftColor: oldp.leftColor };
        }
        return new InteractiveDataDisplay.ColorPalette(false, { min: min, max: max }, points);
    };

    this.relative = function () {
        if (_isNormalized) return this;

        var n = _points.length;
        var k = 1 / (_range.max - _range.min);
        var points = new Array(n);
        for (var i = 0; i < n; i++) {
            var oldp = _points[i];
            points[i] = { x: k * (oldp.x - _range.min), rightColor: oldp.rightColor, leftColor: oldp.leftColor };
        }
        return new InteractiveDataDisplay.ColorPalette(true, { min: 0, max: 1 }, points);
    };

    this.banded = function (bands) {
        if (!bands) throw "bands is undefined";
        var uniformDistr = false;
        if (typeof bands === 'number') { // we got a number of bands
            if (bands < 1) throw new "number of bands is less than 1";
            uniformDistr = true;
            var nInner = bands - 1;
            var bandW = (_range.max - _range.min) / bands;
            bands = new Array(nInner);
            for (var i = 0; i < nInner; i++)
                bands[i] = (i + 1) * bandW + _range.min;
        }

        // bands contains inner points hence we add two from range
        var n = bands.length + 2; // number of points
        var boundsNumber = bands.length + 1;
        if (n < 2) throw "number of bands is less than 1";
        var points = new Array(n);
        var prevColor = this.getHsla(_range.min);
        var k = boundsNumber > 1 ? (_range.max - _range.min) / (boundsNumber - 1) : 0.5 * (_range.max - _range.min);
        var v, x;
        for (var i = 0; i < n - 1; i++) {
            if (i == 0) {
                v = _range.min;
                x = _range.min;
            } else {
                if (i == n - 2) { // i == bands.length
                    v = _range.max;
                }
                else {
                    if (uniformDistr) {
                        v = _range.min + i * k;
                    } else {
                        v = (bands[i - 1] + bands[i]) / 2;
                    }
                }
                if (x >= bands[i - 1]) throw "bands points are incorrect";
                x = bands[i - 1];
            }
            var color = this.getHsla(v);
            var p = { x: x, rightColor: color, leftColor: prevColor };
            points[i] = p;
            prevColor = color;
        }
        if (x >= _range.max) throw "bands points are incorrect";
        points[n - 1] = { x: _range.max, rightColor: prevColor, leftColor: prevColor };

        return new InteractiveDataDisplay.ColorPalette(_isNormalized, _range, points);
    };

    this.gradientString = function() {
        var colors = InteractiveDataDisplay.ColorPalette.getColorNames();
        var getHexColor = function(hsla){
            var toHex = function(v) {
                var h = v.toString(16);
                while(h.length < 2)
                    h = "0" + h;
                return h;
            }
            var rgba = InteractiveDataDisplay.ColorPalette.HSLtoRGB(hsla);
            var r = toHex(rgba.r);
            var g = toHex(rgba.g);
            var b = toHex(rgba.b);
            var color = "#" + r + g + b;

            var names = Object.keys(colors);            
            for(var i = 0; i < names.length; i++){
                var name = names[i];
                if(colors[name] == color){
                    color = name;
                    break;
                }
            }
            return color;
        }

        var str = "";
        var n = _points.length;
        if(!_isNormalized){
            str = _points[0].x + "=";
        }

        for(var i = 1; i < n; i++){
            var pl = _points[i-1];
            var pr = _points[i];

            if(pl.rightColor === pr.leftColor){
                str += getHexColor(pl.rightColor);
            }else{
                str += getHexColor(pl.rightColor) + "," + getHexColor(pr.leftColor);;
            }
            if(i < n-1){
                str += "=" + pr.x + "=";
            }
        }

        if(!_isNormalized){
            str += "=" + _points[n-1].x;
        }
        return str;
    };
};

InteractiveDataDisplay.ColorPalette.getColorNames = function() {
        return {
        "aliceblue": "#f0f8ff", "antiquewhite": "#faebd7", "aqua": "#00ffff", "aquamarine": "#7fffd4", "azure": "#f0ffff", "beige": "#f5f5dc", "bisque": "#ffe4c4", "black": "#000000", "blanchedalmond": "#ffebcd", "blue": "#0000ff", "blueviolet": "#8a2be2", "brown": "#a52a2a", "burlywood": "#deb887",
        "cadetblue": "#5f9ea0", "chartreuse": "#7fff00", "chocolate": "#d2691e", "coral": "#ff7f50", "cornflowerblue": "#6495ed", "cornsilk": "#fff8dc", "crimson": "#dc143c", "cyan": "#00ffff", "darkblue": "#00008b", "darkcyan": "#008b8b", "darkgoldenrod": "#b8860b", "darkgray": "#a9a9a9", "darkgreen": "#006400", "darkkhaki": "#bdb76b", "darkmagenta": "#8b008b", "darkolivegreen": "#556b2f",
        "darkorange": "#ff8c00", "darkorchid": "#9932cc", "darkred": "#8b0000", "darksalmon": "#e9967a", "darkseagreen": "#8fbc8f", "darkslateblue": "#483d8b", "darkslategray": "#2f4f4f", "darkturquoise": "#00ced1", "darkviolet": "#9400d3", "deeppink": "#ff1493", "deepskyblue": "#00bfff", "dimgray": "#696969", "dodgerblue": "#1e90ff",
        "firebrick": "#b22222", "floralwhite": "#fffaf0", "forestgreen": "#228b22", "fuchsia": "#ff00ff", "gainsboro": "#dcdcdc", "ghostwhite": "#f8f8ff", "gold": "#ffd700", "goldenrod": "#daa520", "gray": "#808080", "green": "#008000", "greenyellow": "#adff2f",
        "honeydew": "#f0fff0", "hotpink": "#ff69b4", "indianred ": "#cd5c5c", "indigo ": "#4b0082", "ivory": "#fffff0", "khaki": "#f0e68c", "lavender": "#e6e6fa", "lavenderblush": "#fff0f5", "lawngreen": "#7cfc00", "lemonchiffon": "#fffacd", "lightblue": "#add8e6", "lightcoral": "#f08080", "lightcyan": "#e0ffff", "lightgoldenrodyellow": "#fafad2",
        "lightgrey": "#d3d3d3", "lightgreen": "#90ee90", "lightpink": "#ffb6c1", "lightsalmon": "#ffa07a", "lightseagreen": "#20b2aa", "lightskyblue": "#87cefa", "lightslategray": "#778899", "lightsteelblue": "#b0c4de", "lightyellow": "#ffffe0", "lime": "#00ff00", "limegreen": "#32cd32", "linen": "#faf0e6",
        "magenta": "#ff00ff", "maroon": "#800000", "mediumaquamarine": "#66cdaa", "mediumblue": "#0000cd", "mediumorchid": "#ba55d3", "mediumpurple": "#9370d8", "mediumseagreen": "#3cb371", "mediumslateblue": "#7b68ee", "mediumspringgreen": "#00fa9a", "mediumturquoise": "#48d1cc", "mediumvioletred": "#c71585", "midnightblue": "#191970", "mintcream": "#f5fffa", "mistyrose": "#ffe4e1", "moccasin": "#ffe4b5",
        "navajowhite": "#ffdead", "navy": "#000080", "oldlace": "#fdf5e6", "olive": "#808000", "olivedrab": "#6b8e23", "orange": "#ffa500", "orangered": "#ff4500", "orchid": "#da70d6",
        "palegoldenrod": "#eee8aa", "palegreen": "#98fb98", "paleturquoise": "#afeeee", "palevioletred": "#d87093", "papayawhip": "#ffefd5", "peachpuff": "#ffdab9", "peru": "#cd853f", "pink": "#ffc0cb", "plum": "#dda0dd", "powderblue": "#b0e0e6", "purple": "#800080",
        "red": "#ff0000", "rosybrown": "#bc8f8f", "royalblue": "#4169e1", "saddlebrown": "#8b4513", "salmon": "#fa8072", "sandybrown": "#f4a460", "seagreen": "#2e8b57", "seashell": "#fff5ee", "sienna": "#a0522d", "silver": "#c0c0c0", "skyblue": "#87ceeb", "slateblue": "#6a5acd", "slategray": "#708090", "snow": "#fffafa", "springgreen": "#00ff7f", "steelblue": "#4682b4",
        "tan": "#d2b48c", "teal": "#008080", "thistle": "#d8bfd8", "tomato": "#ff6347", "transparent": "#00000000", "turquoise": "#40e0d0", "violet": "#ee82ee", "wheat": "#f5deb3", "white": "#ffffff", "whitesmoke": "#f5f5f5", "yellow": "#ffff00", "yellowgreen": "#9acd32"
        }
    };

// Discretizes the palette
// Returns an Uint8Array array of numbers with length (4 x number of colors), 
// contains 4 numbers (r,g,b,a) for each color, 
// where 0 <= r,g,b,a <= 255
InteractiveDataDisplay.ColorPalette.toArray = function (palette, n) {
    var colors = new Uint8Array(n << 2);
    var getColor = palette.getRgba;
    var k, min;

    if (palette.isNormalized) {
        k = 1.0 / (n - 1);
        min = 0;
    } else {
        min = palette.range.min;
        k = (palette.range.max - palette.range.min) / (n - 1);
    }

    var c;
    var j;
    for (var i = 0, j = 0; i < n; i++) {
        c = getColor(i * k + min);
        colors[j++] = c.r;
        colors[j++] = c.g;
        colors[j++] = c.b;
        colors[j++] = 255 * c.a;
    }

    return colors;
};

InteractiveDataDisplay.ColorPalette.create = function () {
    var colors = arguments;
    if (!colors || colors.length == 0) throw 'colors is undefined or empty';
    var n = colors.length;
    if (n == 1) {
        n++;
        colors = [colors[0], colors[0]];
    }
    var hslapoints = new Array(n);
    var dx = 1.0 / (n - 1);
    for (var i = 0; i < n; i++) {
        var p = colors[i];
        var hslp = typeof p.r === 'number' ? InteractiveDataDisplay.ColorPalette.RGBtoHSL(p) : p;
        hslapoints[i] = { x: i * dx, rightColor: hslp, leftColor: hslp };
    }
    return new InteractiveDataDisplay.ColorPalette(true, { min: 0, max: 1 }, hslapoints);
};

InteractiveDataDisplay.ColorPalette.parse = function (paletteString) {
    var isNormalized = true;
    var range;
    var points = [];

    if (paletteString == undefined) paletteString = "";
    if (paletteString == "")
        return InteractiveDataDisplay.palettes.grayscale;

    var lexer = new InteractiveDataDisplay.Lexer(paletteString);

    var state = -1;
    var lastNumber;

    if (lexer.readNext()) {
        points.push({ x: 0.0, rightColor: { h: 0, s: 0, l: 0, a: 1 }, leftColor: { h: 0, s: 0, l: 1, a: 1 } });
        if (lexer.currentLexeme == 'number') {
            points[points.length - 1].x = lexer.currentNumber;
            isNormalized = false;
            if (lexer.readNext() && (lexer.currentLexeme != 'separator' || lexer.currentSeparator != 'equal'))
                throw lexer.position + ": separator '=' expected";
            if (lexer.readNext() && lexer.currentLexeme != 'color')
                throw lexer.position + ": color expected";
        }
        if (lexer.currentLexeme == 'color') {
            points[points.length - 1].rightColor = lexer.currentColor;
            points[points.length - 1].leftColor = lexer.currentColor;
            points.push({ x: points[0].x, rightColor: lexer.currentColor, leftColor: lexer.currentColor });
        }
        else throw lexer.position + ": wrong lexeme";
    }

    lastNumber = points[0].x;

    while (lexer.readNext()) {
        if (lexer.currentLexeme == 'separator') {
            if (lexer.currentSeparator == 'equal') {
                if (lexer.readNext()) {
                    if (lexer.currentLexeme == 'number') {
                        if (lexer.currentNumber < lastNumber)
                            throw lexer.position + ": number is less than previous";
                        lastNumber = lexer.currentNumber;
                        if (state == -1) { //x1 = color = x2
                            points[points.length - 1].x = lexer.currentNumber;
                            state = 1;
                        }
                        else if (state == 0) { //color = x
                            points[points.length - 1].x = lexer.currentNumber;
                            state = 2;
                        }
                        else throw lexer.position + ": wrong lexeme";
                    }
                    else if (lexer.currentLexeme == 'color') {
                        if (state == 1 || state == 2) { //x = color (,x=color || color1=x=color2)
                            points[points.length - 1].rightColor = lexer.currentColor;
                            state = -1;
                        }
                        else if (state == 0 || state == -1) { //color1 = color2
                            points[points.length - 1].x = points[0].x - 1;
                            points[points.length - 1].rightColor = lexer.currentColor;
                            state = -1;
                        }
                        else throw lexer.position + ": wrong lexeme";
                    }
                    else throw lexer.position + ": wrong lexeme";
                }
            }
            else if (lexer.currentSeparator == 'comma') {
                if (lexer.readNext()) {
                    if (state == 1 || state == -1 || state == 2) {
                        if (lexer.currentLexeme == 'number') {
                            if (lexer.currentNumber <= lastNumber)
                                throw lexer.position + ": number is less than previous";
                            lastNumber = lexer.currentNumber;
                            //x1 = color, x2
                            if (lexer.readNext() && lexer.currentLexeme == 'separator' && lexer.currentSeparator == 'equal') {
                                if (lexer.readNext() && lexer.currentLexeme == 'color') {
                                    if (state != -1)
                                        points.push({ x: lexer.currentNumber, rightColor: lexer.currentColor, leftColor: lexer.currentColor });
                                    else {
                                        points[points.length - 1].x = lexer.currentNumber;
                                        points[points.length - 1].rightColor = lexer.currentColor;
                                        points[points.length - 1].leftColor = lexer.currentColor;
                                    }
                                    state = -1;
                                }
                                else throw lexer.position + ": color expected";
                            }
                            else throw lexer.position + ": wrong lexeme";
                        }
                        else if (lexer.currentLexeme == 'color') { // x = color1, color2
                            if (state == -1) points.pop();
                            state = 0;
                        }
                        else throw lexer.position + ": wrong lexeme";
                    }
                    else if (state == 0) {
                        if (lexer.currentLexeme == 'number') {
                            if (lexer.currentNumber <= lastNumber)
                                throw lexer.position + ": number is less than previous";
                            lastNumber = lexer.currentNumber;
                            //color, x
                            points[points.length - 1].x = points[0].x - 1;
                            if (lexer.readNext() && lexer.currentLexeme == 'separator' && lexer.currentSeparator == 'equal') {
                                if (lexer.readNext() && lexer.currentLexeme == 'color') {
                                    points.push({ x: lexer.currentNumber, rightColor: lexer.currentColor, leftColor: lexer.currentColor });
                                    state = -1;
                                }
                                else throw lexer.position + ": color expected";
                            }
                            else throw lexer.position + ": wrong lexeme";
                        }
                        else if (lexer.currentLexeme == 'color') { //color1, color2
                            points[points.length - 1].x = points[0].x - 1;
                            state = 0;
                        }
                        else throw lexer.position + ": wrong lexeme";
                    }
                }
            }
            if (state == -1)
                points.push({ x: points[0].x, rightColor: lexer.currentColor, leftColor: lexer.currentColor });
            else if (state == 0)
                points.push({ x: points[0].x, rightColor: lexer.currentColor, leftColor: lexer.currentColor });
        }
        else throw lexer.position + ": separator expected";
    }

    if (lexer.currentLexeme == 'separator') throw lexer.position + ": wrong lexeme";
    if ((lexer.currentLexeme == 'number' && isNormalized) || (lexer.currentLexeme == 'color' && !isNormalized))
        throw lexer.position + ": wrong ending";
    if (isNormalized) {
        points[points.length - 1].x = 1.0;
        if (points[points.length - 1].x < points[points.length - 2].x) throw lexer.position + ": number is less than previous";
    }
    points[points.length - 1].rightColor = points[points.length - 1].leftColor;
    if (points[0].x >= points[points.length - 1].x) throw lexer.position + ": wrong range of palette";
    range = { min: points[0].x, max: points[points.length - 1].x };

    var start = 1;
    var count = 0;
    for (var i = 1, len = points.length; i < len; i++) {
        if (points[i].x == points[0].x - 1) {
            if (count == 0) start = i;
            count++;
        }
        else if (count != 0) {
            var res_x = (points[start + count].x - points[start - 1].x) / (count + 1);
            for (var j = 0; j < count; j++) points[start + j].x = points[start - 1].x + res_x * (j + 1);
            count = 0;
            start = 1;
        }
    }

    return new InteractiveDataDisplay.ColorPalette(isNormalized, range, points);
};

InteractiveDataDisplay.Lexer = function (paletteString) {

    if (typeof (paletteString) !== "string")
        throw "wrong definition of palette: must be a string";

    var _currentColor;
    var _currentNumber;
    var _currentLexeme; // type of lexem: { Color, Separator, Number }
    var _currentSeparator; // type of separator: { Equal, Comma }

    var _paletteString = paletteString;
    var _position = 0;

    Object.defineProperty(this, "position", { get: function () { return _position; }, configurable: false });
    Object.defineProperty(this, "paletteString", { get: function () { return _paletteString; }, configurable: false });
    Object.defineProperty(this, "currentSeparator", { get: function () { return _currentSeparator; }, configurable: false });
    Object.defineProperty(this, "currentLexeme", { get: function () { return _currentLexeme; }, configurable: false });
    Object.defineProperty(this, "currentNumber", { get: function () { return _currentNumber; }, configurable: false });
    Object.defineProperty(this, "currentColor", { get: function () { return _currentColor; }, configurable: false });

    this.readNext = function () {
        if (_position >= _paletteString.length)
            return false;
        while (_paletteString[_position] === ' ') _position++;

        if (_paletteString[_position] === '#' || /^[a-z]/.test(_paletteString[_position].toLowerCase())) {
            _currentLexeme = 'color';
            var start = _position;
            while (_position < _paletteString.length && _paletteString[_position] != ' ' && _paletteString[_position] != '=' && _paletteString[_position] != ',') {
                _position++;
            }
            var color = InteractiveDataDisplay.ColorPalette.colorFromString(_paletteString.substring(start, _position));
            _currentColor = InteractiveDataDisplay.ColorPalette.RGBtoHSL(color);
        }
        else if (_paletteString[_position] === '=' || _paletteString[_position] === ',') {
            _currentLexeme = 'separator';
            if (_paletteString[_position] == '=') _currentSeparator = 'equal';
            else _currentSeparator = 'comma';
            _position++;
        }
        else {
            _currentLexeme = 'number';
            var start = _position;
            while (_position < _paletteString.length && _paletteString[_position] != ' ' && _paletteString[_position] != '=' && _paletteString[_position] != ',') {
                _position++;
            }
            var numberStr = _paletteString.substring(start, _position);
            var numberRes = (numberStr).replace(/[^0-9+-Ee.]/g, '');

            if (numberStr != numberRes) throw "wrong number value";
            _currentNumber = parseFloat(_paletteString.substring(start, _position));
        }
        return true;
    };
};

InteractiveDataDisplay.ColorPalette.colorFromString = function (hexColor) {
    var colours = InteractiveDataDisplay.ColorPalette.getColorNames();
    if (typeof (hexColor) !== "string")
        throw "wrong definition of color: must be a string";

    var _r, _g, _b, _a;

    if (colours[hexColor.toLowerCase()]) {
        var hex = colours[hexColor.toLowerCase()];
        hexColor = hex;
    }
    if (hexColor.charAt(0) == '#') {
        if (hexColor.length == 7) {
            _a = 1;
            _r = parseInt(hexColor.substring(1, 3), 16);
            _g = parseInt(hexColor.substring(3, 5), 16);
            _b = parseInt(hexColor.substring(5, 7), 16);
        }
        else if (hexColor.length == 9) {
            _r = parseInt(hexColor.substring(1, 3), 16);
            _g = parseInt(hexColor.substring(3, 5), 16);
            _b = parseInt(hexColor.substring(5, 7), 16);
            _a = parseInt(hexColor.substring(7, 9), 16) / 255.0;
        }
        else throw "wrong definition of hex color";
    }
    else throw "wrong definition of hex color";

    if (isNaN(_r) || isNaN(_g) || isNaN(_b) || isNaN(_a))
        throw "wrong definition of hex color";

    return { r: _r, g: _g, b: _b, a: _a };
};

// red, green, blue = [0, 255]
// alpha = [0, 1]
InteractiveDataDisplay.ColorPalette.RGBtoHSL = function (rgbaColor) {
    var _h, _s, _l, _a;

    _a = rgbaColor.a;

    var r = rgbaColor.r / 255.0;
    var g = rgbaColor.g / 255.0;
    var b = rgbaColor.b / 255.0;

    var maxcolor = Math.max(r, g);
    maxcolor = Math.max(maxcolor, b);

    var mincolor = Math.min(r, g);
    mincolor = Math.min(mincolor, b);

    _l = (maxcolor + mincolor) / 2.0;

    if (maxcolor == mincolor)
        _s = 0.0;
    else {
        if (_l < 0.5)
            _s = (maxcolor - mincolor) / (maxcolor + mincolor);
        else
            _s = (maxcolor - mincolor) / (2.0 - maxcolor - mincolor);
    }
    if (maxcolor == mincolor)
        _h = 0;
    else if (maxcolor == r) {
        if (g >= b)
            _h = (g - b) / (maxcolor - mincolor);
        else
            _h = (g - b) / (maxcolor - mincolor) + 6.0;
    }
    else if (maxcolor == g)
        _h = 2.0 + (b - r) / (maxcolor - mincolor);
    else if (maxcolor == b)
        _h = 4.0 + (r - g) / (maxcolor - mincolor);

    return { h: _h, s: _s, l: _l, a: _a };
};

// hue = [0, 6]
// saturation, lightness, alpha = [0, 1]
InteractiveDataDisplay.ColorPalette.HSLtoRGB = function (hslaColor) {
    var _r, _g, _b, _a;

    _a = hslaColor.a;

    var hue = hslaColor.h;
    var saturation = hslaColor.s;
    var lightness = hslaColor.l;

    var c = (1.0 - Math.abs(2.0 * lightness - 1.0)) * saturation;
    var x = c * (1.0 - Math.abs(hue % 2.0 - 1.0));

    if (hue < 2) {
        _b = 0;
        if (hue < 1) {
            _r = Math.round(c * 255);
            _g = Math.round(x * 255);
        }
        else {
            _r = Math.round(x * 255);
            _g = Math.round(c * 255);
        }
    }
    else if (hue < 4) {
        _r = 0;
        if (hue < 3) {
            _g = Math.round(c * 255);
            _b = Math.round(x * 255);
        }
        else {
            _g = Math.round(x * 255);
            _b = Math.round(c * 255);
        }
    }
    else if (hue < 6) {
        _g = 0;
        if (hue < 5) {
            _r = Math.round(x * 255);
            _b = Math.round(c * 255);
        }
        else {
            _r = Math.round(c * 255);
            _b = Math.round(x * 255);
        }
    }

    var m = (lightness - c / 2.0) * 255;
    var temp = _r + m;
    if (temp > 255) _r = 255;
    else if (temp < 0) _r = 0;
    else _r = Math.round(temp);

    temp = _g + m;
    if (temp > 255) _g = 255;
    else if (temp < 0) _g = 0;
    else _g = Math.round(temp);

    temp = _b + m;
    if (temp > 255) _b = 255;
    else if (temp < 0) _b = 0;
    else _b = Math.round(temp);

    return { r: _r, g: _g, b: _b, a: _a };
};

InteractiveDataDisplay.ColorPaletteViewer = function (div, palette, options) {
    var _host = div;
    var _width = _host.width();
    var _height = 20;
    var _axisVisible = true;
    var _palette = palette;
    var _dataRange = undefined;

    // Get initial settings from options
    if (options !== undefined) {
        if (options.height !== undefined)
            _height = options.height;
        if (options.width !== undefined)
            _width = options.width;
        if (options.axisVisible !== undefined)
            _axisVisible = options.axisVisible;
    }

    // canvas to render palette
    var _canvas = $("<canvas height='" + _height + "px'" + "width='" + _width + "px' style='display: block'></canvas>");
    _host[0].appendChild(_canvas[0]);
    var _ctx = _canvas.get(0).getContext("2d");

    var _axisDiv = null;
    var _axis = null;

    function addAxis() {
        _axisDiv = $("<div data-idd-placement='bottom' style='width: " + _width + "px; color: rgb(0,0,0)'></div>");
        _host[0].appendChild(_axisDiv[0]);
        _axis = new InteractiveDataDisplay.NumericAxis(_axisDiv);
        if (_palette && !_palette.isNormalized) // Take axis values from fixed palette
            _axis.update({ min: _palette.range.min, max: _palette.range.max });
        else if (_dataRange) // Try to take axis values from data range
            _axis.update({ min: _dataRange.min, max: _dataRange.max });
    }

    function removeAxis() {
        _host[0].removeChild(_axisDiv[0]);
        _axisDiv = null;
        _axis = null;
    }

    if (_axisVisible)
        addAxis();

    Object.defineProperty(this, "axisVisible", {
        get: function () { return _axisVisible; },
        set: function (value) {
            value = value ? true : false;
            if (_axisVisible != value) {
                _axisVisible = value;
                if (_axisVisible)
                    addAxis();
                else
                    removeAxis();
            }
        },
        configurable: false
    });

    Object.defineProperty(this, "palette", {
        get: function () { return _palette; },
        set: function (value) {
            if (value) {
                _palette = value;
                if (_axisVisible && (!_palette.isNormalized || !_dataRange))
                    _axis.update({ min: _palette.range.min, max: _palette.range.max });
                renderPalette();
            }
        },
        configurable: false
    });

    Object.defineProperty(this, "dataRange", {
        get: function () { return _dataRange; },
        set: function (value) {
            if (value) {
                _dataRange = value;
                if (_axisVisible && (!_palette || _palette.isNormalized)) {
                    _axis.update({ min: _dataRange.min, max: _dataRange.max });
                }
            }
        },
        configurable: false
    });


    var renderPalette = function () {
        var alpha = (_palette.range.max - _palette.range.min) / _width;
        var gradient = _ctx.createLinearGradient(0, 0, _width, 0);
        var color;
        var x = _palette.range.min;
        for (var i = 0; i < _width; i++) {
            color = _palette.getRgba(x);
            gradient.addColorStop(i / _width, "rgba(" + color.r + "," + color.g + "," + color.b + "," + color.a + ")");
            x += alpha;
        }

        _ctx.fillStyle = gradient;
        _ctx.fillRect(0, 0, _width, _height);
    };

    if (_palette)
        renderPalette();
};
InteractiveDataDisplay.SvgColorPaletteViewer = function (svg, palette, elementDiv, options) {
    var _width = 170;
    var _height = 20;
    var _axisVisible = true;
    var _palette = palette;
    var _dataRange = undefined;

    // Get initial settings from options
    if (options !== undefined) {
        if (options.height !== undefined)
            _height = options.height;
        if (options.width !== undefined)
            _width = options.width;
        if (options.axisVisible !== undefined)
            _axisVisible = options.axisVisible;
    }
    var _axis = null;
    var _axis_g = svg.group();
    function addAxis() {
        var _axis = elementDiv.children[1];
        _axis.axis.renderToSvg(_axis_g);
        _axis_g.translate(0, _height + 0.5);
    }

    function removeAxis() {
        _axis = null;
    }

    if (_axisVisible)
        addAxis();

    var renderPalette = function () {
        var color;
        var alpha = (_palette.range.max - _palette.range.min) / _width;
        var gradient = svg.gradient("linear", function (stop) {
            var x = _palette.range.min;
            for (var i = 0; i < _width; i++) {
                color = _palette.getRgba(x);
                stop.at(i / _width, "rgba(" + color.r + "," + color.g + "," + color.b + "," + color.a + ")");
                x += alpha;
            }
        });
        svg.rect(_width, _height).fill(gradient);
    };

    if (_palette)
        renderPalette();
};
//-----------------------------------------------------------------------------
// Size palette

// Size palette
// isNormalized: bool
// valueRange: {min, max}, min <= max
// sizeRange: {min, max}
InteractiveDataDisplay.SizePalette = function (isNormalized, sizeRange, valueRange) {
    var _isNormalized;
    var _range;
    var _sizeRange;
    var that = this;

    Object.defineProperty(this, "isNormalized", { get: function () { return _isNormalized; }, configurable: false });
    Object.defineProperty(this, "range", { get: function () { return _range; }, configurable: false });
    Object.defineProperty(this, "sizeRange", { get: function () { return _sizeRange; }, configurable: false });

    _isNormalized = isNormalized;
    if (_isNormalized) _range = { min: 0, max: 1 };
    else _range = { min: valueRange.min, max: valueRange.max };
    _sizeRange = { min: sizeRange.min, max: sizeRange.max };
    if (_range.min > _range.max) throw "valueRange is incorrect (min >= max)";

    var k = (_sizeRange.max - _sizeRange.min) / (_range.max - _range.min);

    this.getSize = function (value) {
        if (value <= _range.min) return _sizeRange.min;
        if (value >= _range.max) return _sizeRange.max;

        return k * (value - _range.min) + _sizeRange.min;
    };
};

InteractiveDataDisplay.SizePalette.Create = function (source) {
    if(source instanceof InteractiveDataDisplay.SizePalette) return source;
    var sizeRange = source.sizeRange;
    var valueRange = source.valueRange;
    return new InteractiveDataDisplay.SizePalette(typeof valueRange == "undefined", sizeRange, valueRange);
}

InteractiveDataDisplay.SizePaletteViewer = function (div, palette, options) {
    var _host = div;
    var _width = _host.width();
    var _height = 35;
    var _axisVisible = true;
    var _palette = palette;

    if (options !== undefined) {
        if (options.axisVisible !== undefined)
            _axisVisible = options.axisVisible;
        if (options.width !== undefined)
            _width = options.width;
        if (options.height !== undefined)
            _height = options.height;
    }

    // canvas to render palette
    var _canvas = $("<canvas height='" + _height + "px'" + "width='" + _width + "px' style='display: block'></canvas>");
    _host[0].appendChild(_canvas[0]);

    var _axis = null;
    var _axisDiv = null;
    function addAxis() {
        _axisDiv = $("<div data-idd-placement='bottom' style='width: " + _width + "px; margin-top: -1px; color: rgb(0,0,0)'></div>");
        _axis = new InteractiveDataDisplay.NumericAxis(_axisDiv);
        _host[0].appendChild(_axisDiv[0]);

        if (_palette) {
            if (!_palette.isNormalized) {
                _axis.update({ min: _palette.range.min, max: _palette.range.max });
            }
        } else if (_dataRange)
            _axis.update({ min: _dataRange.min, max: _dataRange.max });
    }

    function removeAxis() {
        _host[0].removeChild(_axisDiv[0]);
        _axisDiv = null;
        _axis = null;
    }

    if (_axisVisible)
        addAxis();

    Object.defineProperty(this, "axisVisible", {
        get: function () { return _axisVisible; },
        set: function (value) {
            value = value ? true : false;
            if (_axisVisible != value) {
                _axisVisible = value;
                if (_axisVisible)
                    addAxis();
                else
                    removeAxis();
            }
        },
        configurable: false
    });

    Object.defineProperty(this, "palette", {
        get: function () { return _palette; },
        set: function (value) {
            if (value) {
                _palette = value;
                if (_axisVisible && !_palette.isNormalized) {
                    _axis.update({ min: _palette.range.min, max: _palette.range.max });
                }
                renderPalette();
            }
        },
        configurable: false
    });

    var _dataRange = undefined;
    Object.defineProperty(this, "dataRange", {
        get: function () { return _dataRange; },
        set: function (value) {
            if (value) {
                _dataRange = value;
                if (_axisVisible && (!_palette || _palette.isNormalized)) {
                    _axis.update({ min: _dataRange.min, max: _dataRange.max });
                }
            }
        },
        configurable: false
    });

    var _ctx = _canvas.get(0).getContext("2d");

    var renderPalette = function () {
        var color;
        _ctx.clearRect(0, 0, _width, _height);

        _ctx.fillStyle = "lightgray";
        _ctx.strokeStyle = "black";

        var minHeight = 0;
        var maxHeight = _height;
        if (_palette && _palette.sizeRange) {
            minHeight = _palette.sizeRange.min;
            maxHeight = _palette.sizeRange.max;
        }
        var middle = _height * _width / Math.max(maxHeight, minHeight);

        _ctx.beginPath();
        _ctx.moveTo(0, _height);
        if (minHeight != 0) {
            _ctx.lineTo(0, Math.max(0, _height - minHeight));
        }

        if (middle < _width) {
            _ctx.lineTo(middle, 0);
            if (minHeight <= maxHeight) _ctx.lineTo(_width, 0);
            else _ctx.lineTo(_width, Math.max(0, _height - maxHeight));
        }
        else {
            _ctx.lineTo(_width, Math.max(0, _height - maxHeight));
        }
        _ctx.lineTo(_width, _height);
        _ctx.lineTo(0, _height);
        _ctx.closePath();
        _ctx.fill();
        _ctx.stroke();
    };

    renderPalette();
};

InteractiveDataDisplay.SvgSizePaletteViewer = function (svg, palette, elementDiv, options) {
    var _width = 170;
    var _height = 75;
    var _axisVisible = true;
    var _palette = palette;

    if (options !== undefined) {
        if (options.axisVisible !== undefined)
            _axisVisible = options.axisVisible;
        if (options.width !== undefined)
            _width = options.width;
        if (options.height !== undefined)
            _height = options.height;
    }

    var _axis = null;
    function addAxis() {
        var _axis = elementDiv.children[1];
        var _axis_g = svg.group();
        _axis.axis.renderToSvg(_axis_g);
        _axis_g.translate(0, _height);
    }
    function removeAxis() {
        _axis = null;
    }

    if (_axisVisible)
        addAxis();

    var renderPalette = function () {
        var minHeight = 0;
        var maxHeight = _height;
        if (_palette.sizeRange) {
            minHeight = _palette.sizeRange.min;
            maxHeight = _palette.sizeRange.max;
        }
        var middle = _height * _width / Math.max(maxHeight, minHeight);

        var points = [];
        if (minHeight != 0) points.push([0, Math.max(0, _height - minHeight)]);
        else points.push([0, _height]);//0
        if (middle < _width) {
            points.push([middle, 0]);//1
            if (minHeight <= maxHeight) points.push([_width, 0]);//2
            else points.push([_width, Math.max(0, _height - maxHeight)]);// 2
        }
        else {
            points.push([_width, Math.max(0, _height - maxHeight)]);// 1
            points.push([_width, Math.max(0, _height - maxHeight)]);
        }
        svg.polyline([[0, _height], points[0], points[1], points[2], [_width, _height], [0, _height]]).fill("lightgray").stroke("black");
    };

    renderPalette();
};

InteractiveDataDisplay.UncertaintySizePaletteViewer = function (div, options) {
    var _host = div;
    var _width = _host.width();
    var _height = 65;

    if (options !== undefined) {
        if (options.width !== undefined)
            _width = options.width;
        if (options.height !== undefined)
            _height = options.height;
    }

    var _maxDelta = undefined;
    Object.defineProperty(this, "maxDelta", {
        get: function () { return _maxDelta; },
        set: function (value) {
            if (value) {
                _maxDelta = value;
                renderPalette();
            }
        }
    });

    var canvas = $("<canvas height='50px'></canvas>");
    _host[0].appendChild(canvas[0]);
    var context = canvas[0].getContext("2d");
    var markers = [
        { x: 25, y: 20, min: 16, max: 16 },
        { x: 75, y: 20, min: 10, max: 16 },
        { x: 125, y: 20, min: 0, max: 16 }];

    var renderPalette = function () {
        //canvas[0].width = canvas[0].width;
        // draw sample markers
        for (var i = 0; i < markers.length; i++) {
            InteractiveDataDisplay.Petal.drawSample(context, markers[i].x, markers[i].y, markers[i].min, markers[i].max, "#484848");
        }
        // draw arrow
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(20, 45.5);
        context.lineTo(118, 45.5);
        context.stroke();
        context.closePath();
        context.beginPath();
        context.moveTo(118, 45.5);
        context.lineTo(103.5, 40.5);
        context.lineTo(103.5, 49.5);
        context.lineTo(118, 45.5);
        context.stroke();
        context.closePath();
        context.fill();
            
        // if maxData is known - stroke value
        context.strokeStyle = "black";
        context.fillStyle = "black";
        context.lineWidth = 1;
        if (_maxDelta) {
            context.fillText("X", 9, 49);
            context.fillText("X", 122, 49);
            context.beginPath();
            context.moveTo(134, 44.5);
            context.lineTo(141, 44.5);
            context.stroke();
            context.closePath();
            context.beginPath();
            context.moveTo(134, 48.5);
            context.lineTo(141, 48.5);
            context.stroke();
            context.closePath();
            context.beginPath();
            context.moveTo(137.5, 41);
            context.lineTo(137.5, 48);
            context.stroke();
            context.closePath();
            context.fillText("", round(_maxDelta, { min: 0, max: _maxDelta }, false), 145, 49);
        }
    }
    renderPalette();
     // add text 'uncertainty'
    $("<div style='margin-left: 30px; margin-top: -10px'>uncertainty</div>").appendTo(_host);
};

InteractiveDataDisplay.palettes = {
    grayscale: new InteractiveDataDisplay.ColorPalette(true, { min: 0, max: 1 }, [{ x: 0.0, rightColor: { h: 0, s: 0, l: 0, a: 1 }, leftColor: { h: 0, s: 0, l: 0, a: 1 } },
                                                              { x: 1.0, rightColor: { h: 0, s: 0, l: 1, a: 1 }, leftColor: { h: 0, s: 0, l: 1, a: 1 } }])
};

