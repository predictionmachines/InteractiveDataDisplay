/// <reference path="../ext/jasmine/jasmine.js" />
/// <reference path="../ext/jquery/dist/jquery.min.js" />
/// <reference path="../dist/idd.js" />

// quick reference for Jasmine framework:
// http://pivotal.github.com/jasmine/ 
// https://github.com/pivotal/jasmine/wiki 

describe('idd.js Navigation', function () {
    it('should pan plot rect for 2 units right and top', function () {
        var screenRect = { left: 0, top: 0, width: 100, height: 100 };
        var plotRect = { x: 0, y: 0, width: 100, height: 100 };
        var t = new InteractiveDataDisplay.CoordinateTransform(plotRect, screenRect);

        var pannedPlotRect = InteractiveDataDisplay.NavigationUtils.calcPannedRect(plotRect, screenRect, new InteractiveDataDisplay.Gestures.PanGesture(2, 2, "Mouse"));

        expect(pannedPlotRect.x).toBe(-2);
        expect(pannedPlotRect.y).toBe(2);
        expect(pannedPlotRect.width).toBe(100);
        expect(pannedPlotRect.height).toBe(100);
    });

    it('should pan plot rect for 3 units right and top', function () {
        var screenRect = { left: 0, top: 0, width: 200, height: 200 };
        var plotRect = { x: 0, y: 0, width: 100, height: 100 };
        var t = new InteractiveDataDisplay.CoordinateTransform(plotRect, screenRect);

        var pannedPlotRect = InteractiveDataDisplay.NavigationUtils.calcPannedRect(plotRect, screenRect, new InteractiveDataDisplay.Gestures.PanGesture(6, 6, "Mouse"));

        expect(pannedPlotRect.x).toBe(-3);
        expect(pannedPlotRect.y).toBe(3);
        expect(pannedPlotRect.width).toBe(100);
        expect(pannedPlotRect.height).toBe(100);
    });

    it('should zoom rect for 2 times relative to the center', function () {
        var screenRect = { left: 0, top: 0, width: 100, height: 100 };
        var plotRect = { x: 0, y: 0, width: 100, height: 100 };
        var t = new InteractiveDataDisplay.CoordinateTransform(plotRect, screenRect);

        var zoomedPlotRect = InteractiveDataDisplay.NavigationUtils.calcZoomedRect(plotRect, t, new InteractiveDataDisplay.Gestures.ZoomGesture(50, 50, 0.5, "Mouse"));

        expect(zoomedPlotRect.x).toBe(25);
        expect(zoomedPlotRect.y).toBe(25);
        expect(zoomedPlotRect.width).toBe(50);
        expect(zoomedPlotRect.height).toBe(50);
    });

    it('should zoom rect for 2 times relative to the point (25,25) in screen coordinates', function () {
        var screenRect = { left: 0, top: 0, width: 100, height: 100 };
        var plotRect = { x: 0, y: 0, width: 100, height: 100 };
        var t = new InteractiveDataDisplay.CoordinateTransform(plotRect, screenRect);

        var zoomedPlotRect = InteractiveDataDisplay.NavigationUtils.calcZoomedRect(plotRect, t, new InteractiveDataDisplay.Gestures.ZoomGesture(25, 25, 0.5, "Mouse"));

        expect(zoomedPlotRect.x).toBe(12.5);
        expect(zoomedPlotRect.y).toBe(37.5);
        expect(zoomedPlotRect.width).toBe(50);
        expect(zoomedPlotRect.height).toBe(50);
    });

});