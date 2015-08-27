/// <reference path="../ext/jasmine/jasmine.js" />
/// <reference path="../ext/jquery/dist/jquery.min.js" />
/// <reference path="../dist/idd.js" />

// quick reference for Jasmine framework:
// http://pivotal.github.com/jasmine/ 
// https://github.com/pivotal/jasmine/wiki 

var newPlot = function (name, plot) {
    var div = document.createElement("div");
    div.setAttribute("data-idd-plot", plot || "plot");
    div.setAttribute("data-idd-name", name);
    var plot = InteractiveDataDisplay.asPlot($(div));
    return plot;
};

var newPlotNoInitialization = function (name, plot) {
    var div = document.createElement("div");
    div.setAttribute("data-idd-plot", plot || "plot");
    div.setAttribute("data-idd-name", name);
    return div;
};

describe('InteractiveDataDisplay.Plot', function () {
    var plot;

    beforeEach(function () {
        plot = newPlot("master");
    });

    it('should be properly initialized', function () {
        expect(plot.name).toBe("master");
        expect(plot.master).toBe(plot);
        expect(plot.isMaster).toBe(true);
        expect(plot.host).toBeDefined();
        expect(plot.host).not.toBeNull();
        expect(plot.children).toBeDefined();
        expect(plot.children.length).toBe(0);
    });

    it('.addChild() should add new plot object to the children collection and fire the event', function () {
        var spyMaster = jasmine.createSpy("master.childrenChanged");
        var spyChild = jasmine.createSpy("child.childrenChanged");

        var child = newPlot("child");

        plot.host.bind("childrenChanged", spyMaster);
        child.host.bind("childrenChanged", spyChild);

        plot.addChild(child);

        expect(plot.children.length).toBe(1);
        expect(plot.isMaster).toBe(true);
        expect(child.isMaster).toBe(false);
        expect(plot.master).toBe(plot);
        expect(child.master).toBe(plot);

        expect(spyMaster).toHaveBeenCalled();
        expect(spyChild).not.toHaveBeenCalled();
    });

    it('.addChild() should cause update layout', function (done) {
        var child = newPlot("child");
        plot.updateLayout = done;

        plot.addChild(child);
        expect(plot.requestsUpdateLayout).toBe(true);
    });

    it('.removeChild() should remove a child from children and fire the event', function () {
        var spyMaster = jasmine.createSpy("master.childrenChanged");
        var spyChild = jasmine.createSpy("child.childrenChanged");

        var child = newPlot("child");
        plot.addChild(child);

        plot.host.bind("childrenChanged", spyMaster);
        child.host.bind("childrenChanged", spyChild);

        plot.removeChild(child);

        expect(plot.children.length).toBe(0);
        expect(plot.isMaster).toBe(true);
        expect(child.isMaster).toBe(true);
        expect(plot.master).toBe(plot);
        expect(child.master).toBe(child);

        expect(spyMaster).toHaveBeenCalled();
        expect(spyChild).not.toHaveBeenCalled();
    });

    it('.removeChild() should cause update layout', function (done) {
        var child = newPlot("child");

        plot.updateLayout = function () {
            expect(plot.requestsUpdateLayout).toBe(false);
            plot.updateLayout = done;
            plot.removeChild(child);
        }

        plot.addChild(child);
        expect(plot.requestsUpdateLayout).toBe(true);
    });

    it('.removeChild() should allow further addChild()', function () {
        var spyMaster = jasmine.createSpy("master.childrenChanged");
        var spyChild = jasmine.createSpy("child.childrenChanged");

        var child = newPlot("child");
        plot.addChild(child);
        plot.removeChild(child);

        plot.host.bind("childrenChanged", spyMaster);
        child.host.bind("childrenChanged", spyChild);

        plot.addChild(child);

        expect(plot.children.length).toBe(1);
        expect(plot.isMaster).toBe(true);
        expect(child.isMaster).toBe(false);
        expect(plot.master).toBe(plot);
        expect(child.master).toBe(plot);

        expect(spyMaster).toHaveBeenCalled();
        expect(spyChild).not.toHaveBeenCalled();
    });

    //TODO: check whether this is still actual or not
    /*
    it('properly handles the case when rendering is requested but plot is removed when it should be rendered', function () {
        var child = plot.polyline("child", { y: [1, 2, 3] });

        var invoked = false;
        plot.render = function () { invoked = true; };

        runs(function () {
            child.remove();
            child.requestNextFrame();
        });

        waitsFor(function () {
            return invoked;
        }, "Render is not invoked", 500);

    });
    */

    it("doesn't get a removed plot", function () {
        var child = plot.polyline("child", { y: [1, 2, 3] });

        expect(plot.host.find(".idd-plot-dependant").length).toBe(1);
        expect(plot.get("child")).toBe(child);
        expect(plot.children.some(function (p) {
            return p.name == "child";
        })).toBe(true);

        child.remove();

        expect(plot.children.some(function (p) {
            return p.name == "child";
        })).toBe(false);

        expect(plot.get("child")).not.toBeDefined();
        expect(plot.host.find(".idd-plot-dependant").length).toBe(0);
    });
});

describe('Initialization of InteractiveDataDisplay.Plot', function () {
    it(':> InteractiveDataDisplay.Chart using .asPlot() with 2 children plots', function () {
        var innerPlot1 = newPlotNoInitialization("plot1", "heatmap");
        var innerPlot2 = newPlotNoInitialization("plot2", "heatmap");
        var master = newPlotNoInitialization("master");
        $(master).append(innerPlot1).append(innerPlot2);

        var masterPlot = InteractiveDataDisplay.asPlot(master);
        expect(masterPlot).toBeDefined();
        expect(masterPlot).not.toBeNull();
        expect(masterPlot.children.length).toBe(2);
        expect(masterPlot.isMaster).toBe(true);
        expect(masterPlot.master).toBe(masterPlot);

        var child1 = masterPlot.get("plot1");
        expect(child1).toBeDefined();
        expect(child1).not.toBeNull();
        expect(child1.children.length).toBe(0);
        expect(child1.isMaster).toBe(false);
        expect(child1.master).toBe(masterPlot);
        expect(child1).toBe(InteractiveDataDisplay.asPlot(innerPlot1));

        var child2 = masterPlot.get("plot2");
        expect(child2).toBeDefined();
        expect(child2).not.toBeNull();
        expect(child2.children.length).toBe(0);
        expect(child2.isMaster).toBe(false);
        expect(child2.master).toBe(masterPlot);
        expect(child2).toBe(InteractiveDataDisplay.asPlot(innerPlot2));
    });

    it(' for non-existing <div> should throw an exception', function () {
        expect(function () { InteractiveDataDisplay.asPlot("nonexistingdiv"); }).toThrow();
    });

    it(' for <p> should throw an exception', function () {
        var p = document.createElement("p");
        p.setAttribute("data-idd-plot", "plot");
        p.setAttribute("data-idd-name", "name");
        expect(function () { InteractiveDataDisplay.asPlot(p); }).toThrow();
    });
});


describe('Custom plots', function () {
    it("can be registered using InteractiveDataDisplay.register()", function () {
        var div = document.createElement("div");
        $(div).attr("data-idd-plot", "key");

        var factory = jasmine.createSpy("keyPlotFactory");
        expect(function () { InteractiveDataDisplay.asPlot(div); }).toThrow();

        InteractiveDataDisplay.register("key", factory);
        InteractiveDataDisplay.asPlot(div);
        expect(factory).toHaveBeenCalled();
    });
});

describe('InteractiveDataDisplay.Heatmap', function () {

    var fSimple = [
        [0.1, 0.2, 0.0, 0.1],
        [-0.1, 0.02, 0.05, 0.2],
        [0.02, -0.1, 0.05, 0.22]
    ];


    it('should initialize using InteractiveDataDisplay.Plot.heatmap()', function () {
        var master = newPlot("master");
        var h = master.heatmap("heat123", { f: fSimple });
        expect(master.children.length).toBe(1);
        expect(h.children.length).toBe(0);
        expect(h.isMaster).toBe(false);
        expect(h.master).toBe(master);
        expect(h.name).toBe("heat123");
        expect(h).toBe(InteractiveDataDisplay.asPlot(h.host[0]));

        var h2 = master.heatmap("heat123", { f: fSimple });
        expect(h2).toBe(h);
        expect(master.children.length).toBe(1);
        expect(h2.children.length).toBe(0);
        expect(h2.isMaster).toBe(false);
        expect(h2.master).toBe(master);
        expect(h2.name).toBe("heat123");
        expect(h2).toBe(InteractiveDataDisplay.asPlot(h2.host[0]));
    });

    //it('enables x and y to be omitted in the data', function () {
    //    var master = newPlot("master");
    //    var h2 = master.heatmap("heat123", { f: fSimple });
    //    // TODO: add expectations
    //});

    it('mutually restricts lengths of f, x and y', function () {
        var master = newPlot("master");

        var x2 = [0, 1];
        var y3 = [0, 1, 2];
        var x3 = [0, 1, 2];
        var y4 = [0, 1, 2, 3];
        var f23 = [[0, 1, 2], [3, 4, 5]];

        var h1 = master.heatmap("heat1", { f: f23, x: x2, y: y3 });
        expect(h1.mode).toBe("gradient");

        var h2 = master.heatmap("heat2", { f: f23, x: x3, y: y4 });
        expect(h2.mode).toBe("matrix");

        expect(function () { master.heatmap("heat3", { f: f23, x: x2, y: x2 }); }).toThrow();
        expect(master.children.length).toBe(3);

        expect(function () { master.heatmap("heat4", { f: [[1, 2, 3]], x: [0], y: [0, 1, 2] }); }).toThrow();
    });

    /*  it('renders a gradient heatmap', function () {
          var w = 2048;
          var h = 1024;
          var n = 1000;
          var m = 1000;
  
  
          var canvas = document.createElement("canvas");
          var ctx = canvas.getContext("2d");
          var img = ctx.createImageData(w, h);
  
          var x = new Array(n);
          var y = new Array(m);
          var f = new Array(n);
          for (var i = 0; i < n; i++) 
              f[i] = new Array(m);
          for (var i = 0; i < n; i++)
              x[i] = -Math.PI + 2 * i * Math.PI / n;
          for (var j = 0; j < m; j++)
              y[j] = -Math.PI / 2 + j * Math.PI / m;
          var phase = 0;
          for (var i = 0; i < n; i++)
              for (var j = 0; j < m; j++)
                  f[i][j] = Math.sqrt(x[i] * x[i] + y[j] * y[j])
                            * Math.abs(Math.cos(x[i] * x[i] + y[j] * y[j] + phase));
  
          var palette = InteractiveDataDisplay.palettes.grayscale;
  
          renderGradient(img, x, y, f, 0, 3, palette, { x: x[0], y: y[0], width: x[n - 1] - x[0], height: y[n - 1] - y[0] },
              function (x) { return x; }, function (x) { return x; }, function (y) { return y; }, function (y) { return y; }, false, false);
  
      });*/
});