/// <reference path="../ext/jasmine/jasmine.js" />
/// <reference path="../ext/jquery/dist/jquery.min.js" />
/// <reference path="../dist/idd.js" />

// quick reference for Jasmine framework:
// http://pivotal.github.com/jasmine/ 
// https://github.com/pivotal/jasmine/wiki 

describe('idd.js CoordinateTransform', function () {
    it('should transform (50, 50) on the plot to (320, 240) on the screen and vice versa', function () {
        var screenRect = { left: 0, top: 0, width: 640, height: 480 };
        var plotRect = { x: 0, y: 0, width: 100, height: 100 };
        var t = new InteractiveDataDisplay.CoordinateTransform(plotRect, screenRect);

        expect(t.plotToScreenX(50)).toBe(320);
        expect(t.plotToScreenY(50)).toBe(240);

        expect(t.screenToPlotX(320)).toBe(50);
        expect(t.screenToPlotY(240)).toBe(50);
    });

    it('should transform corner points of the screen to corner points of visible region (expanded by Y)', function () {
        var screenRect = { left: 0, top: 0, width: 90, height: 60 };
        var plotRect = { x: 0, y: 0, width: 3, height: 2 };
        var aspectRatio = 2;
        var t = new InteractiveDataDisplay.CoordinateTransform(plotRect, screenRect, aspectRatio);

        expect(t.screenToPlotX(0)).toBe(0);
        expect(t.screenToPlotX(90)).toBe(3);
        expect(t.screenToPlotY(0)).toBe(4);
        expect(t.screenToPlotY(60)).toBe(0);
    });

    it('should transform corner points of the screen to corner points of visible region (expanded by X)', function () {
        var screenRect = { left: 0, top: 0, width: 90, height: 60 };
        var plotRect = { x: 0, y: 0, width: 3, height: 2 };
        var aspectRatio = 0.5;
        var t = new InteractiveDataDisplay.CoordinateTransform(plotRect, screenRect, aspectRatio);

        expect(t.screenToPlotX(0)).toBe(0);
        expect(t.screenToPlotX(90)).toBe(6);
        expect(t.screenToPlotY(0)).toBe(2);
        expect(t.screenToPlotY(60)).toBe(0);
    });

    it('should transform internal points of visible region (expanded by Y) to appropriate points of the screen', function () {
        var screenRect = { left: 3, top: 2.3, width: 202, height: 104.7 };
        var plotRect = { x: -3.88, y: -3.88, width: 14.38, height: 8.58 };
        var aspectRatio = 2;
        var t = new InteractiveDataDisplay.CoordinateTransform(plotRect, screenRect, aspectRatio);

        expect(t.plotToScreenX(0)).toBeCloseTo(57.50349, 0.00001);
        expect(t.plotToScreenY(11.02679)).toBeCloseTo(2.3, 0.00001);

        expect(t.plotToScreenX(8)).toBeCloseTo(169.8818, 0.00001);
        expect(t.plotToScreenY(-2)).toBeCloseTo(93.7955, 0.00001);

        expect(t.plotToScreenX(9)).toBeCloseTo(183.92910, 0.00001);
        expect(t.plotToScreenY(6)).toBeCloseTo(37.60639, 0.00001);
    });

    it('should calculate correct plot rect from coordinate transform for given screen rect ', function () {
        var screenRect = { left: 0, top: 0, width: 100, height: 100 };
        var plotRect = { x: -50, y: -50, width: 100, height: 70 };
        var aspectRatio = -1;
        var t = new InteractiveDataDisplay.CoordinateTransform(plotRect, screenRect, aspectRatio);

        var expectedPlotRect = t.getPlotRect({ x: 0, y: 0, width: 100, height: 100 });

        expect(expectedPlotRect.x).toBeCloseTo(-50, 0.00001);
        expect(expectedPlotRect.y).toBeCloseTo(-50, 0.00001);
        expect(expectedPlotRect.width).toBeCloseTo(100, 0.00001);
        expect(expectedPlotRect.height).toBeCloseTo(70, 0.00001);

    });

});