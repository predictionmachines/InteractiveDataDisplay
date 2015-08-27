/// <reference path="../ext/jasmine/lib/jasmine-core/jasmine.js" />
/// <reference path="../ext/jquery/dist/jquery.min.js" />
/// <reference path="../dist/idd.js" />

// quick reference for Jasmine framework:
// http://pivotal.github.com/jasmine/ 
// https://github.com/pivotal/jasmine/wiki 

describe('idd.js BingMapsAnimation during navigation', function () {
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

});