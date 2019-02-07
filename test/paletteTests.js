/// <reference path="../ext/jasmine/jasmine.js" />
/// <reference path="../ext/jquery/dist/jquery.min.js" />
/// <reference path="../dist/idd.js" />

// quick reference for Jasmine framework:
// http://pivotal.github.com/jasmine/ 
// https://github.com/pivotal/jasmine/wiki 

var assertRgbaEqual = function (c1, c2) {
    expect(c1.r).toBe(c2.r);
    expect(c1.g).toBe(c2.g);
    expect(c1.b).toBe(c2.b);
    expect(c1.a).toBe(c2.a);
};

describe('palette.js InteractiveDataDisplay.ColorPalette', function () {
    it('color converting methods should convert colors from rgb to hsl and vice versa', function () {
        for (var r = 0; r <= 10; r++) {
            for (var g = 100; g <= 110; g++) {
                for (var b = 200; b <= 210; b++) {
                    var a = 1;
                    var hslColor = InteractiveDataDisplay.ColorPalette.RGBtoHSL({ r: r, g: g, b: b, a: a });
                    var rgbColor = InteractiveDataDisplay.ColorPalette.HSLtoRGB({ h: hslColor.h, s: hslColor.s, l: hslColor.l, a: hslColor.a });

                    expect(rgbColor.r).toBe(r);
                    expect(rgbColor.g).toBe(g);
                    expect(rgbColor.b).toBe(b);
                    expect(rgbColor.a).toBe(a);
                }
            }
        }
    });
});

describe('palette.js InteractiveDataDisplay.Lexer', function () {
    it('colorFromString method should convert colors from hex value to rgba', function () {
        // black color
        var color = InteractiveDataDisplay.ColorPalette.colorFromString("#000000");
        expect(color.r).toBe(0);
        expect(color.g).toBe(0);
        expect(color.b).toBe(0);
        expect(color.a).toBe(1);

        // white color
        var color = InteractiveDataDisplay.ColorPalette.colorFromString("#ffffff");
        expect(color.r).toBe(255);
        expect(color.g).toBe(255);
        expect(color.b).toBe(255);
        expect(color.a).toBe(1);

        // gray color
        var color = InteractiveDataDisplay.ColorPalette.colorFromString("#7f7f7f");
        expect(color.r).toBe(127);
        expect(color.g).toBe(127);
        expect(color.b).toBe(127);
        expect(color.a).toBe(1);

        // custom color
        var color = InteractiveDataDisplay.ColorPalette.colorFromString("#63a90c");
        expect(color.r).toBe(99);
        expect(color.g).toBe(169);
        expect(color.b).toBe(12);
        expect(color.a).toBe(1);

        // color with opacity
        var color = InteractiveDataDisplay.ColorPalette.colorFromString("#76aac18b");
        expect(color.r).toBe(118);
        expect(color.g).toBe(170);
        expect(color.b).toBe(193);
        expect(color.a).toBe(0.5450980392156862);
    });

    it('colorFromString method should convert colors from names value to rgba', function () {
        // red color
        var color = InteractiveDataDisplay.ColorPalette.colorFromString("red");
        expect(color.r).toBe(255);
        expect(color.g).toBe(0);
        expect(color.b).toBe(0);
        expect(color.a).toBe(1);

        // white color
        var color = InteractiveDataDisplay.ColorPalette.colorFromString("white");
        expect(color.r).toBe(255);
        expect(color.g).toBe(255);
        expect(color.b).toBe(255);
        expect(color.a).toBe(1);

        // black color
        var color = InteractiveDataDisplay.ColorPalette.colorFromString("black");
        expect(color.r).toBe(0);
        expect(color.g).toBe(0);
        expect(color.b).toBe(0);
        expect(color.a).toBe(1);
    });

    it('colorFromString method should convert colors from rgb(red, green, blue) value to rgba', function () {
        // red color
        var color = InteractiveDataDisplay.ColorPalette.colorFromString("rgb(255,0,0)");
        expect(color.r).toBe(255);
        expect(color.g).toBe(0);
        expect(color.b).toBe(0);
        expect(color.a).toBe(1);

        // white color
        var color = InteractiveDataDisplay.ColorPalette.colorFromString("rgb(255, 255, 255)");
        expect(color.r).toBe(255);
        expect(color.g).toBe(255);
        expect(color.b).toBe(255);
        expect(color.a).toBe(1);

        // black color
        var color = InteractiveDataDisplay.ColorPalette.colorFromString("rgb(0,0,0)");
        expect(color.r).toBe(0);
        expect(color.g).toBe(0);
        expect(color.b).toBe(0);
        expect(color.a).toBe(1);
    });

    it('colorFromString method should convert colors from rgb(red%, green%, blue%) value to rgba', function () {
        // red color
        var color = InteractiveDataDisplay.ColorPalette.colorFromString("rgb(100%,0%,0%)");
        expect(color.r).toBe(255);
        expect(color.g).toBe(0);
        expect(color.b).toBe(0);
        expect(color.a).toBe(1);

        // white color
        var color = InteractiveDataDisplay.ColorPalette.colorFromString("rgb(100%, 100%, 100%)");
        expect(color.r).toBe(255);
        expect(color.g).toBe(255);
        expect(color.b).toBe(255);
        expect(color.a).toBe(1);

        // black color
        var color = InteractiveDataDisplay.ColorPalette.colorFromString("rgb(0%,0%,0%)");
        expect(color.r).toBe(0);
        expect(color.g).toBe(0);
        expect(color.b).toBe(0);
        expect(color.a).toBe(1);
    });

    it('colorFromString method should convert colors from rgba(red, green, blue, alpha) value to rgba', function () {
        // red color
        var color = InteractiveDataDisplay.ColorPalette.colorFromString("rgba(255,0,0,1.0)");
        expect(color.r).toBe(255);
        expect(color.g).toBe(0);
        expect(color.b).toBe(0);
        expect(color.a).toBe(1);

        // white color
        var color = InteractiveDataDisplay.ColorPalette.colorFromString("rgba(255, 255, 255, 1.0)");
        expect(color.r).toBe(255);
        expect(color.g).toBe(255);
        expect(color.b).toBe(255);
        expect(color.a).toBe(1);

        // black color
        var color = InteractiveDataDisplay.ColorPalette.colorFromString("rgba(0,0,0, 1.0)");
        expect(color.r).toBe(0);
        expect(color.g).toBe(0);
        expect(color.b).toBe(0);
        expect(color.a).toBe(1);

        // red color, tranparent
        var color = InteractiveDataDisplay.ColorPalette.colorFromString("rgba(255,0,0, 0.2)");
        expect(color.r).toBe(255);
        expect(color.g).toBe(0);
        expect(color.b).toBe(0);
        expect(color.a).toBe(0.2);
    });
});

describe('palette.js InteractiveDataDisplay.ColorPalette', function () {
    it('parse method should convert strings into instances of palette', function () {
        var checkPoint = function (point, left, right, x) {
            var lColor = InteractiveDataDisplay.ColorPalette.colorFromString(left);
            var rColor = InteractiveDataDisplay.ColorPalette.colorFromString(right);
            var pleft = InteractiveDataDisplay.ColorPalette.HSLtoRGB(point.leftColor);
            var pright = InteractiveDataDisplay.ColorPalette.HSLtoRGB(point.rightColor);
            expect(pleft.r).toBe(lColor.r);
            expect(pleft.g).toBe(lColor.g);
            expect(pleft.b).toBe(lColor.b);
            expect(pleft.a).toBe(lColor.a);
            expect(pright.r).toBe(rColor.r);
            expect(pright.g).toBe(rColor.g);
            expect(pright.b).toBe(rColor.b);
            expect(pright.a).toBe(rColor.a);
            expect(point.x).toBe(x);
        };
        var checkRange = function (palette, min, max) {
            expect(palette.range.min).toBe(min);
            expect(palette.range.max).toBe(max);
        };

        //"0=Red,White=10=Red,White=20=Red=30=Blue=40=Green=50,60=Yellow=70";
        var s = "0=#ff0000,#ffffff=10=#ff0000,#ffffff=20=#ff0000=30=#0000ff=40=#00ff00=50,60=#ffff00=70"
        var p = InteractiveDataDisplay.ColorPalette.parse(s);
        //expect(p.toString()).toBe(s);
        expect(p.isNormalized).toBe(false);
        checkRange(p, 0, 70);
        checkPoint(p.points[0], '#ff0000', '#ff0000', 0);
        checkPoint(p.points[1], '#ffffff', '#ff0000', 10);
        checkPoint(p.points[2], '#ffffff', '#ff0000', 20);
        checkPoint(p.points[3], '#ff0000', '#0000ff', 30);
        checkPoint(p.points[4], '#0000ff', '#00ff00', 40);
        checkPoint(p.points[5], '#00ff00', '#00ff00', 50);
        checkPoint(p.points[6], '#ffff00', '#ffff00', 60);
        checkPoint(p.points[7], '#ffff00', '#ffff00', 70);

        //"White=0.2,Red=0.3=Green=0.4=Red,Blue=0.5,Red=0.6=Blue,0.7=Yellow=0.8,Green";
        s = "#ffffff=0.2,#ff0000=0.3=#00ff00=0.4=#ff0000,#0000ff=0.5,#ff0000=0.6=#0000ff,0.7=#ffff00=0.8,#00ff00";
        p = InteractiveDataDisplay.ColorPalette.parse(s);
        //expect(p.toString()).toBe(s);
        expect(p.isNormalized).toBe(true);
        checkRange(p, 0, 1);
        checkPoint(p.points[0], '#ffffff', '#ffffff', 0);
        checkPoint(p.points[1], '#ffffff', '#ffffff', 0.2);
        checkPoint(p.points[2], '#ff0000', '#00ff00', 0.3);
        checkPoint(p.points[3], '#00ff00', '#ff0000', 0.4);
        checkPoint(p.points[4], '#0000ff', '#0000ff', 0.5);
        checkPoint(p.points[5], '#ff0000', '#0000ff', 0.6);
        checkPoint(p.points[6], '#ffff00', '#ffff00', 0.7);
        checkPoint(p.points[7], '#ffff00', '#ffff00', 0.8);
        checkPoint(p.points[8], '#00ff00', '#00ff00', 1);

        //"Red=0.2=Green=0.35=Blue,Yellow=0.5=Green,Yellow=0.6,0.75=Red=0.9=Blue";
        s = "#ff0000=0.2=#00ff00=0.35=#0000ff,#ffff00=0.5=#00ff00,#ffff00=0.6,0.75=#ff0000=0.9=#0000ff";
        p = InteractiveDataDisplay.ColorPalette.parse(s);
        //expect(p.toString()).toBe(s);
        expect(p.isNormalized).toBe(true);
        checkRange(p, 0, 1);
        checkPoint(p.points[0], '#ff0000', '#ff0000', 0);
        checkPoint(p.points[1], '#ff0000', '#00ff00', 0.2);
        checkPoint(p.points[2], '#00ff00', '#0000ff', 0.35);
        checkPoint(p.points[3], '#ffff00', '#00ff00', 0.5);
        checkPoint(p.points[4], '#ffff00', '#ffff00', 0.6);
        checkPoint(p.points[5], '#ff0000', '#ff0000', 0.75);
        checkPoint(p.points[6], '#ff0000', '#0000ff', 0.9);
        checkPoint(p.points[7], '#0000ff', '#0000ff', 1);

        //"-50=Red=-40,Green=-30,Blue=-20,Yellow=-10=White=0,Blue=10=Green,Blue=20";
        s = "-50=#ff0000=-40,#00ff00=-30,#0000ff=-20,#ffff00=-10=#ffffff=0,#0000ff=10=#00ff00,#0000ff=20";
        p = InteractiveDataDisplay.ColorPalette.parse(s);
        //expect(p.toString()).toBe(s);
        expect(p.isNormalized).toBe(false);
        checkRange(p, -50, 20);
        checkPoint(p.points[0], '#ff0000', '#ff0000', -50);
        checkPoint(p.points[1], '#ff0000', '#ff0000', -40);
        checkPoint(p.points[2], '#00ff00', '#00ff00', -30);
        checkPoint(p.points[3], '#0000ff', '#0000ff', -20);
        checkPoint(p.points[4], '#ffff00', '#ffffff', -10);
        checkPoint(p.points[5], '#ffffff', '#ffffff', 0);
        checkPoint(p.points[6], '#0000ff', '#00ff00', 10);
        checkPoint(p.points[7], '#0000ff', '#0000ff', 20);

        //"0=Blue=10=Green,20=Yellow=30=Red,40=White=50,Blue=60=Green,Yellow=70=Red,Blue=80";
        s = "0=#0000ff=10=#00ff00,20=#ffff00=30=#ff0000,40=#ffffff=50,#0000ff=60=#00ff00,#ffff00=70=#ff0000,#0000ff=80";
        p = InteractiveDataDisplay.ColorPalette.parse(s);
        //expect(p.toString()).toBe(s);
        expect(p.isNormalized).toBe(false);
        checkRange(p, 0, 80);
        checkPoint(p.points[0], '#0000ff', '#0000ff', 0);
        checkPoint(p.points[1], '#0000ff', '#00ff00', 10);
        checkPoint(p.points[2], '#ffff00', '#ffff00', 20);
        checkPoint(p.points[3], '#ffff00', '#ff0000', 30);
        checkPoint(p.points[4], '#ffffff', '#ffffff', 40);
        checkPoint(p.points[5], '#ffffff', '#ffffff', 50);
        checkPoint(p.points[6], '#0000ff', '#00ff00', 60);
        checkPoint(p.points[7], '#ffff00', '#ff0000', 70);
        checkPoint(p.points[8], '#0000ff', '#0000ff', 80);

        //"-50=Red=-40,Green=-30,Blue=-20,-10=Yellow=0=White,Blue=10=Green,Blue=20";
        s = "-50=#ff0000=-40,#00ff00=-30,#0000ff=-20,-10=#ffff00=0=#ffffff,#0000ff=10=#00ff00,#0000ff=20";
        p = InteractiveDataDisplay.ColorPalette.parse(s);
        //expect(p.toString()).toBe(s);
        expect(p.isNormalized).toBe(false);
        checkRange(p, -50, 20);
        checkPoint(p.points[0], '#ff0000', '#ff0000', -50);
        checkPoint(p.points[1], '#ff0000', '#ff0000', -40);
        checkPoint(p.points[2], '#00ff00', '#00ff00', -30);
        checkPoint(p.points[3], '#0000ff', '#0000ff', -20);
        checkPoint(p.points[4], '#ffff00', '#ffff00', -10);
        checkPoint(p.points[5], '#ffff00', '#ffffff', 0);
        checkPoint(p.points[6], '#0000ff', '#00ff00', 10);
        checkPoint(p.points[7], '#0000ff', '#0000ff', 20);

        //"Red,Green,Blue";
        s = "#ff0000,#00ff00,#0000ff";
        p = InteractiveDataDisplay.ColorPalette.parse(s);
        //expect(p.toString()).toBe(s);
        expect(p.isNormalized).toBe(true);
        checkRange(p, 0, 1);
        checkPoint(p.points[0], '#ff0000', '#ff0000', 0);
        checkPoint(p.points[1], '#00ff00', '#00ff00', 0.5);
        checkPoint(p.points[2], '#0000ff', '#0000ff', 1);

        //"-30=Red=Green=Blue=30";
        s = "-30=#ff0000=#00ff00=#0000ff=30";
        p = InteractiveDataDisplay.ColorPalette.parse(s);
        //expect(p.toString()).toBe(s);
        expect(p.isNormalized).toBe(false);
        checkRange(p, -30, 30);
        checkPoint(p.points[0], '#ff0000', '#ff0000', -30);
        checkPoint(p.points[1], '#ff0000', '#00ff00', -10);
        checkPoint(p.points[2], '#00ff00', '#0000ff', 10);
        checkPoint(p.points[3], '#0000ff', '#0000ff', 30);

        //"Red,Green,Blue=0.4=Blue=Green=Red";
        s = "#ff0000,#00ff00,#0000ff=0.4=#0000ff=#00ff00=#ff0000";
        p = InteractiveDataDisplay.ColorPalette.parse(s);
        //expect(p.toString()).toBe(s);
        expect(p.isNormalized).toBe(true);
        checkRange(p, 0, 1);
        checkPoint(p.points[0], '#ff0000', '#ff0000', 0);
        checkPoint(p.points[1], '#00ff00', '#00ff00', 0.2);
        checkPoint(p.points[2], '#0000ff', '#0000ff', 0.4);
        checkPoint(p.points[3], '#0000ff', '#00ff00', 0.6);
        checkPoint(p.points[4], '#00ff00', '#ff0000', 0.8);
        checkPoint(p.points[5], '#ff0000', '#ff0000', 1);

        //"-1e-5=Red,Green=2e-5,Blue=3.5e-4";
        s = "-1e-5=#ff0000,#00ff00=2e-5,#0000ff=3.5e-4";
        p = InteractiveDataDisplay.ColorPalette.parse(s);
        //expect(p.toString()).toBe(s);
        expect(p.isNormalized).toBe(false);
        checkRange(p, -1e-5, 3.5e-4);
        checkPoint(p.points[0], '#ff0000', '#ff0000', -1e-5);
        checkPoint(p.points[1], '#00ff00', '#00ff00', 2e-5);
        checkPoint(p.points[2], '#0000ff', '#0000ff', 3.5e-4);

        //"0=Red,#0000a0=30,#ff80ff=50,#ff80ff60=80,Yellow=100";
        s = "0=#ff0000,#0000a0=30,#ff80ff=50,#ff80ff60=80,#ffff00=100";
        p = InteractiveDataDisplay.ColorPalette.parse(s);
        //expect(p.toString()).toBe(s);
        expect(p.isNormalized).toBe(false);
        checkRange(p, 0, 100);
        checkPoint(p.points[0], '#ff0000', '#ff0000', 0);
        checkPoint(p.points[1], '#0000a0', '#0000a0', 30);
        checkPoint(p.points[2], '#ff80ff', '#ff80ff', 50);
        checkPoint(p.points[3], '#ff80ff60', '#ff80ff60', 80);
        checkPoint(p.points[4], '#ffff00', '#ffff00', 100);


        //wrong palette: isNormalized
        //"Red,Green=10=Yellow=1";
        s = "#ff0000,#00ff00=10=#ffff00=1";
        expect(function () { InteractiveDataDisplay.ColorPalette.parse(s); }).toThrow();

        //wrong symbols
        //"Red=0.3=Green()";
        s = "#ff0000=0.3=#00ff00()";
        expect(function () { InteractiveDataDisplay.ColorPalette.parse(s); }).toThrow();

        //wrong string
        //"Red=,0.5=Green";
        s = "#ff0000=,0.5=#00ff00";
        expect(function () { InteractiveDataDisplay.ColorPalette.parse(s); }).toThrow();

        //wrong points
        //"Red=0.2,Green=0.5=Blue=0.3=Yellow";
        s = "#ff0000=0.2,#00ff00=0.5=#0000ff=0.3=#ffff00";
        expect(function () { InteractiveDataDisplay.ColorPalette.parse(s); }).toThrow();

        //wrong name of color
        //"Red=0.2,Green=0.5=xyz";
        s = "#ff0000=0.2,#00ff00=0.5=xyz";
        expect(function () { InteractiveDataDisplay.ColorPalette.parse(s); }).toThrow();
    });
});

describe('palette.js InteractiveDataDisplay.ColorPalette', function () {
    it('testing interpolation in HSL space', function () {

        var checkColor = function (color1, color2) {
            if (typeof (color2) == "string") {
                var color = InteractiveDataDisplay.ColorPalette.colorFromString(color2);
                expect(color1.r).toBe(color.r);
                expect(color1.g).toBe(color.g);
                expect(color1.b).toBe(color.b);
                expect(color1.a).toBe(color.a);
            }
            else {
                expect(color1.r).toBe(color2.r);
                expect(color1.g).toBe(color2.g);
                expect(color1.b).toBe(color2.b);
                expect(color1.a).toBe(color2.a);
            }
        };

        // Lightness test
        var palette = InteractiveDataDisplay.ColorPalette.parse("#ffffff,#000000");
        var c = palette.getRgba(0.0);
        checkColor(c, '#ffffff');
        c = palette.getRgba(0.25);
        checkColor(c, '#bfbfbf');
        c = palette.getRgba(0.5);
        checkColor(c, '#808080');
        c = palette.getRgba(0.75);
        checkColor(c, '#404040');
        c = palette.getRgba(1.0);
        checkColor(c, '#000000');

        // Hue test #1
        palette = InteractiveDataDisplay.ColorPalette.parse("0=#ff0000,#ffff00=2,#00ff00=4,#00ffff=6,#0000ff=8,#ff00ff=10");
        c = palette.getRgba(1.0);
        checkColor(c, '#ff8000');
        c = palette.getRgba(3.0);
        checkColor(c, '#80ff00');
        c = palette.getRgba(5.0);
        checkColor(c, '#00ff80');
        c = palette.getRgba(7.0);
        checkColor(c, '#0080ff');
        c = palette.getRgba(9.0);
        checkColor(c, '#8000ff');

        // Hue test #2
        palette = InteractiveDataDisplay.ColorPalette.parse("#ffff00,#ff00ff");
        c = palette.getRgba(0.0);
        checkColor(c, '#ffff00');
        c = palette.getRgba(0.25);
        checkColor(c, '#ff8000');
        c = palette.getRgba(0.5);
        checkColor(c, '#ff0000');
        c = palette.getRgba(0.75);
        checkColor(c, '#ff0080');
        c = palette.getRgba(1.0);
        checkColor(c, '#ff00ff');

        // Hue test #3
        palette = InteractiveDataDisplay.ColorPalette.parse("#ff00ff,#ffff00");
        c = palette.getRgba(1.0);
        checkColor(c, '#ffff00');
        c = palette.getRgba(0.75);
        checkColor(c, '#ff8000');
        c = palette.getRgba(0.5);
        checkColor(c, '#ff0000');
        c = palette.getRgba(0.25);
        checkColor(c, '#ff0080');
        c = palette.getRgba(0.0);
        checkColor(c, '#ff00ff');

        // Saturation test
        palette = InteractiveDataDisplay.ColorPalette.parse("#ff0000,#808080");
        c = palette.getRgba(0.0);
        checkColor(c, '#ff0000');
        c = palette.getRgba(0.25);
        checkColor(c, '#df2020');
        c = palette.getRgba(0.5)
        checkColor(c, '#bf4040');
        c = palette.getRgba(0.75);
        checkColor(c, '#a06060');
        c = palette.getRgba(1.0);
        checkColor(c, '#808080');

        // Alpha test
        palette = InteractiveDataDisplay.ColorPalette.parse("#ff0000ff,#ff000000");
        c = palette.getRgba(0.0);
        checkColor(c, { r: 255, g: 0, b: 0, a: 1.0 });
        c = palette.getRgba(0.25);
        checkColor(c, { r: 255, g: 0, b: 0, a: 0.75 });
        c = palette.getRgba(0.5);
        checkColor(c, { r: 255, g: 0, b: 0, a: 0.5 });
        c = palette.getRgba(0.75);
        checkColor(c, { r: 255, g: 0, b: 0, a: 0.25 });
        c = palette.getRgba(1.0);
        checkColor(c, { r: 255, g: 0, b: 0, a: 0.0 });
    });

    it('.create(colors) creates a relative palette', function () {
        expect(function () { InteractiveDataDisplay.ColorPalette.create(); }).toThrow();

        var color = { r: 255, g: 0, b: 255, a: 1 };
        var p1 = InteractiveDataDisplay.ColorPalette.create(color);
        expect(p1.isNormalized).toBe(true);
        expect(p1.range.min).toBe(0);
        expect(p1.range.max).toBe(1);
        assertRgbaEqual(p1.getRgba(0), color);
        assertRgbaEqual(p1.getRgba(0.45), color);
        assertRgbaEqual(p1.getRgba(1), color);
        assertRgbaEqual(p1.getRgba(-1), color);
        assertRgbaEqual(p1.getRgba(2), color);

        var c1 = { r: 0, g: 0, b: 0, a: 0 };
        var c2 = InteractiveDataDisplay.ColorPalette.RGBtoHSL({ r: 255, g: 255, b: 255, a: 1 });
        var p2 = InteractiveDataDisplay.ColorPalette.create(c1, c2);
        assertRgbaEqual(p2.getRgba(0), c1);
        assertRgbaEqual(p2.getRgba(0.5), { r: 128, g: 128, b: 128, a: 0.5 });
        assertRgbaEqual(p2.getRgba(1), InteractiveDataDisplay.ColorPalette.HSLtoRGB(c2));
        assertRgbaEqual(p2.getRgba(-1), c1);
        assertRgbaEqual(p2.getRgba(2), InteractiveDataDisplay.ColorPalette.HSLtoRGB(c2));
    });

    it('.absolute(min,max) makes an absolute palette from existing one', function () {

        var color = { r: 255, g: 0, b: 255, a: 1 };
        var p1 = InteractiveDataDisplay.ColorPalette.create(color).absolute(-100, 100);
        expect(p1.isNormalized).toBe(false);
        expect(p1.range.min).toBe(-100);
        expect(p1.range.max).toBe(100);
        assertRgbaEqual(p1.getRgba(-100), color);
        assertRgbaEqual(p1.getRgba(0), color);
        assertRgbaEqual(p1.getRgba(100), color);

        var c1 = { r: 0, g: 0, b: 0, a: 0 };
        var c2 = InteractiveDataDisplay.ColorPalette.RGBtoHSL({ r: 255, g: 255, b: 255, a: 1 });

        var p2 = InteractiveDataDisplay.ColorPalette.create(c1, c2).absolute(-100, 100);
        expect(p2.isNormalized).toBe(false);
        expect(p2.range.min).toBe(-100);
        expect(p2.range.max).toBe(100);
        assertRgbaEqual(p2.getRgba(-100), c1);
        assertRgbaEqual(p2.getRgba(0), { r: 128, g: 128, b: 128, a: 0.5 });
        assertRgbaEqual(p2.getRgba(100), InteractiveDataDisplay.ColorPalette.HSLtoRGB(c2));
        assertRgbaEqual(p2.getRgba(-1000), c1);
        assertRgbaEqual(p2.getRgba(2000), InteractiveDataDisplay.ColorPalette.HSLtoRGB(c2));

        var p3 = p2.absolute(0, 100);
        expect(p3.isNormalized).toBe(false);
        expect(p3.range.min).toBe(0);
        expect(p3.range.max).toBe(100);
        assertRgbaEqual(p3.getRgba(0), c1);
        assertRgbaEqual(p3.getRgba(50), { r: 128, g: 128, b: 128, a: 0.5 });
        assertRgbaEqual(p3.getRgba(100), InteractiveDataDisplay.ColorPalette.HSLtoRGB(c2));
        assertRgbaEqual(p3.getRgba(-1000), c1);
        assertRgbaEqual(p3.getRgba(2000), InteractiveDataDisplay.ColorPalette.HSLtoRGB(c2));

        expect(function () { p2.absolute(100, 0); }).toThrow();
    });

    it('.palette() makes a relative palette from existing one', function () {
        var c1 = { r: 0, g: 0, b: 0, a: 0 };
        var c2 = InteractiveDataDisplay.ColorPalette.RGBtoHSL({ r: 255, g: 255, b: 255, a: 1 });

        var p2 = InteractiveDataDisplay.ColorPalette.create(c1, c2).absolute(-100, 100).relative();
        expect(p2.isNormalized).toBe(true);
        expect(p2.range.min).toBe(0);
        expect(p2.range.max).toBe(1);
        assertRgbaEqual(p2.getRgba(0), c1);
        assertRgbaEqual(p2.getRgba(0.5), { r: 128, g: 128, b: 128, a: 0.5 });
        assertRgbaEqual(p2.getRgba(1), InteractiveDataDisplay.ColorPalette.HSLtoRGB(c2));
        assertRgbaEqual(p2.getRgba(-2), c1);
        assertRgbaEqual(p2.getRgba(2000), InteractiveDataDisplay.ColorPalette.HSLtoRGB(c2));

        var p2 = InteractiveDataDisplay.ColorPalette.create(c1, c2).absolute(-100, 100).relative().relative();
        expect(p2.isNormalized).toBe(true);
        expect(p2.range.min).toBe(0);
        expect(p2.range.max).toBe(1);
        assertRgbaEqual(p2.getRgba(0), c1);
        assertRgbaEqual(p2.getRgba(0.5), { r: 128, g: 128, b: 128, a: 0.5 });
        assertRgbaEqual(p2.getRgba(1), InteractiveDataDisplay.ColorPalette.HSLtoRGB(c2));
        assertRgbaEqual(p2.getRgba(-2), c1);
        assertRgbaEqual(p2.getRgba(2000), InteractiveDataDisplay.ColorPalette.HSLtoRGB(c2));
    });

    it(".banded() makes a banded palette from existing one", function () {
        var c1 = { r: 0, g: 0, b: 0, a: 0 };
        var c2 = InteractiveDataDisplay.ColorPalette.RGBtoHSL({ r: 255, g: 255, b: 255, a: 1 });
        var p = InteractiveDataDisplay.ColorPalette.create(c1, c2).absolute(-100, 100);

        var p2 = p.banded(2);
        expect(p2.isNormalized).toBe(false);
        expect(p2.range.min).toBe(-100);
        expect(p2.range.max).toBe(100);
        assertRgbaEqual(p2.getRgba(-100), c1);
        assertRgbaEqual(p2.getRgba(-0.1), c1);
        assertRgbaEqual(p2.getRgba(0.1), InteractiveDataDisplay.ColorPalette.HSLtoRGB(c2));
        assertRgbaEqual(p2.getRgba(100), InteractiveDataDisplay.ColorPalette.HSLtoRGB(c2));

        var p3 = p.relative().banded([0.25, 0.5, 0.75]);
        expect(p3.isNormalized).toBe(true);
        expect(p3.range.min).toBe(0);
        expect(p3.range.max).toBe(1);
        assertRgbaEqual(p3.getRgba(0), c1);
        assertRgbaEqual(p3.getRgba(0.2), c1);
        assertRgbaEqual(p3.getRgba(0.3), { r: 96, g: 96, b: 96, a: 0.375 });
        assertRgbaEqual(p3.getRgba(0.4), { r: 96, g: 96, b: 96, a: 0.375 });
        assertRgbaEqual(p3.getRgba(0.6), { r: 159, g: 159, b: 159, a: 0.625 });
        assertRgbaEqual(p3.getRgba(0.7), { r: 159, g: 159, b: 159, a: 0.625 });
        assertRgbaEqual(p3.getRgba(0.8), InteractiveDataDisplay.ColorPalette.HSLtoRGB(c2));
        assertRgbaEqual(p3.getRgba(1), InteractiveDataDisplay.ColorPalette.HSLtoRGB(c2));

        expect(function () { p.banded(); }).toThrow();
        expect(function () { p.banded(0); }).toThrow();
        expect(function () { p.banded(-1000); }).toThrow();
        expect(function () { p.banded([-1000]); }).toThrow();
        expect(function () { p.banded([50, 20]); }).toThrow();
        expect(function () { p.banded([150]); }).toThrow();
    });
});