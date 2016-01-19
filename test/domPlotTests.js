/// <reference path="../ext/jasmine/jasmine.js" />
/// <reference path="../ext/jquery/dist/jquery.min.js" />
/// <reference path="../dist/idd.js" />

// quick reference for Jasmine framework:
// http://pivotal.github.com/jasmine/ 
// https://github.com/pivotal/jasmine/wiki 

describe('InteractiveDataDisplay.DOMPlot', function () {
    var plot,div;

    var isPhantomJS = /PhantomJS/.test(window.navigator.userAgent);
    
    beforeEach(function () {
        div = document.createElement("div");
        div.setAttribute("data-idd-plot", "dom");
        div.setAttribute("data-idd-name", "dom");
        plot = InteractiveDataDisplay.asPlot($(div));
    });

    it('should be properly initialized', function () {
        expect(plot.name).toBe("dom");
        expect(plot.master).toBe(plot);
        expect(plot.isMaster).toBe(true);
        expect(plot.host).toBeDefined();
        expect(plot.host).not.toBeNull();
        expect(plot.children).toBeDefined();
        expect(plot.children.length).toBe(0);
    });

    it('should add new DOM element and populate domElements collection', function () {
        var added = plot.add("<div id='newEl'>Hello</div>");
        expect(added).toBeDefined();
        expect(added).not.toBeNull();
        expect(plot.children.length).toBe(0);
        expect(plot.domElements).toBeDefined();
        expect(plot.domElements.length).toBe(1);
        expect(plot.domElements[0].get(0)).toBe(added);
        expect($(plot.host).children("#newEl").get(0)).toBe(added);

        var added2 = plot.add("<div id='newEl2'>Hello</div>");
        expect(added2).toBeDefined();
        expect(added2).not.toBeNull();
        expect(plot.domElements.length).toBe(2);
        expect(plot.domElements[1].get(0)).toBe(added2);
        expect($(plot.host).children("#newEl2").get(0)).toBe(added2);
    });

    it('should remove existing DOM element', function () {
        var added = plot.add("<div id='newEl'>Hello</div>");
        var added2 = plot.add("<div id='newEl2'>Hello</div>");
        var added3 = plot.add("<div id='newEl3'>Hello</div>");

        expect(plot.domElements.length).toBe(3);
        plot.remove(added2);
        expect(plot.domElements.length).toBe(2);
        expect(plot.domElements[0].get(0)).toBe(added);
        expect(plot.domElements[1].get(0)).toBe(added3);
        expect($(plot.host).children("#newEl2").length).toBe(0);
    });

    it('.add() should cause update layout', function (done) {
        // Test is succeded when done is called by updateLayout
        plot.updateLayout = done;
        plot.add("<div id='newEl'>Hello</div>");
        expect(plot.requestsUpdateLayout).toBe(true);
    });

    it('.remove() should cause update layout', function (done) {
        // Test is succeded when done is called by updateLayout
        plot.updateLayout = done;
        plot.add("<div id='newEl'>Hello</div>");
        expect(plot.requestsUpdateLayout).toBe(true);
    });

    it('should add new DOM element with proper properties', function () {
        plot.add("<div id='newEl'>Hello</div>", 'content', 0.1, 0.2, 1, 2);
        expect(plot.domElements[0]._x).toBe(0.1);
        expect(plot.domElements[0]._y).toBe(0.2);
        expect(plot.domElements[0]._width).toBe(1);
        expect(plot.domElements[0]._height).toBe(2);
        expect(plot.domElements[0]._originX).toBe(0);
        expect(plot.domElements[0]._originY).toBe(0);
        expect(plot.domElements[0]._scale).toBe('content');

        plot.add("<div id='newEl2'>Hello</div>", 'content', 0.1, 0.2, 1, 2, 0.5, 0.5);
        expect(plot.domElements[1]._x).toBe(0.1);
        expect(plot.domElements[1]._y).toBe(0.2);
        expect(plot.domElements[1]._width).toBe(1);
        expect(plot.domElements[1]._height).toBe(2);
        expect(plot.domElements[1]._originX).toBe(0.5);
        expect(plot.domElements[1]._originY).toBe(0.5);
        expect(plot.domElements[1]._scale).toBe('content');
    });

    it('added DOM element should cause correct bounding box', function () {
        plot.add("<div id='newEl'>Hello</div>", 'content', 0.1, 0.2, 1, 2);
        var bb = plot.getLocalBounds(); 
        expect(bb.x).toBe(0.1);
        expect(bb.y).toBe(-1.8); // less point
        expect(bb.width).toBe(1);
        expect(bb.height).toBe(2);

        plot.add("<div id='newEl2'>Hello</div>", 'element', 0.5, 1.0, 1, 1);
        bb = plot.getLocalBounds();
        expect(bb.x).toBe(0.1);
        expect(bb.y).toBe(-1.8); // less point
        expect(bb.width).toBe(1.4);
        expect(bb.height).toBe(2.8);
    });
});

