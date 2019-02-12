/// <reference path="../ext/jasmine/jasmine.js" />
/// <reference path="../ext/jquery/dist/jquery.min.js" />
/// <reference path="../ext/svg.js/dist/svg.js" />
/// <reference path="../dist/idd.js" />

describe('idd.js exportToSvg', function () {
    var chart;
    var plot;
    var chartWithTitles;
    var divWidth = 800;
    var divHeight = 600;
    var isPhantomJS = /PhantomJS/.test(window.navigator.userAgent);
    beforeEach(function () {
        var div = $("<div id='chart' data-idd-plot='chart' style='width:800px;height:600px'></div>");
        chart = InteractiveDataDisplay.asPlot($(div));
        var div2 = $("<div id='chart' data-idd-plot='plot' style='width:800px;height:600px'></div>");
        plot = InteractiveDataDisplay.asPlot($(div2));
        var div3 = $("<div id='chart' data-idd-plot='chart' style='width:800px;height:600px'><div data-idd-placement='top' class='idd-title'>Polyline sample</div><div data-idd-placement='bottom' class='idd-horizontalTitle'>X</div><div data-idd-placement='left' class='idd-verticalTitle' ><div class='idd-verticalTitle-inner'>Y</div></div></div>");
        chartWithTitles = InteractiveDataDisplay.asPlot($(div3));
    });
    it('polyline export', function () {
        var line = plot.polyline("p1", { x: [1, 2, 3], y: [1, 2, 3] });
        line.updateLayout();
        var svg = line.exportToSvg();
        expect(svg.node.nodeName).toBe("svg");
        expect(line.host.width()).toBe(divWidth);
        expect(line.host.height()).toBe(divHeight);
        expect(svg.width()).toBe(divWidth);
        expect(svg.height()).toBe(divHeight);
        var svgline = svg.get(1);
        //check the type of element
        expect(svgline.node.nodeName).toBe("polyline");
        var points = svgline.attr("points").split(' ');
        expect(points.length).toBe(3);
        //style
        expect(svgline.style("stroke")).toBe("#4169ed");
        expect(svgline.style("fill")).toBe("none");
        expect(svgline.style("stroke-width")).toBe("1px");
    });
    it('markers export', function () {
        var markers = plot.markers("mark", { x: [1, 2, 3], y: [1, 2, 3], color: "green", border: "gray" });
        markers.updateLayout();
        var svg = markers.exportToSvg();
        expect(svg.width()).toBe(divWidth);
        expect(svg.height()).toBe(divHeight);
        expect(svg.node.nodeName).toBe("svg");
        var svgmarker_g = svg.get(1);
        expect(svgmarker_g.node.nodeName).toBe("g");
        expect(svgmarker_g.attr("clip-path")).not.toBeUndefined();
        var children = svgmarker_g.children();
        expect(children.length).toBe(3);
        for (var i = 0; i < children.length; i++) {
            expect(children[i].node.nodeName).toBe("rect");
            expect(children[i].style("stroke")).toBe("#808080");
            expect(children[i].attr("fill")).toBe("green");
        }

    });
    it('area export', function () {
        var area = plot.area("p1", { x: [1, 2, 3], y1: [1, 2, 3], y2: [3, 5, 8] });
        area.updateLayout();
        var svg = area.exportToSvg();
        expect(svg.width()).toBe(divWidth);
        expect(svg.height()).toBe(divHeight);
        expect(svg.node.nodeName).toBe("svg");
        var areasvg = svg.get(1).get(0);
        //check the type of element
        expect(areasvg.node.nodeName).toBe("polyline");
        var points = areasvg.attr("points").split(' ');
        expect(points.length).toBe(7);
        expect(svg.get(1).attr("clip-path")).not.toBeUndefined();
    });
    it('bar chart export', function () {
        var bars = plot.markers("bars", { x: [1, 2, 3], y: [1, 2, 3], barWidth: 0.9, shape: "bars" });
        bars.updateLayout();
        var svg = bars.exportToSvg();
        expect(svg.width()).toBe(divWidth);
        expect(svg.height()).toBe(divHeight);
        expect(svg.node.nodeName).toBe("svg");
        var barssvg = svg.get(1);
        expect(barssvg.node.nodeName).toBe("g");
        expect(barssvg.attr("clip-path")).not.toBeUndefined();
        var children = barssvg.children();
        expect(children.length).toBe(6);
        for (var i = 0; i < 6; i++) 
            expect(children[i].node.nodeName).toBe("polyline");
    });
    it('chart export', function () {
        var svg = chart.exportToSvg();
        expect(svg.width()).toBe(divWidth + 220);
        expect(svg.height()).toBe(divHeight);
        expect(svg.node.nodeName).toBe("svg");
        //chart group
        var group1 = svg.get(1);
        expect(group1.node.nodeName).toBe("g");
        var children = group1.children();
        expect(children.length).toBe(5);
        for (var i = 0; i < 5; i++)
            expect(children[i].node.nodeName).toBe("g");
        //legend group
        var group2 = svg.get(2);
        expect(group2.node.nodeName).toBe("g");
        expect(group2.children().length).toBe(1);
        expect(group2.get(0).node.nodeName).toBe("svg");
    });
    it('chart titles export', function () {
        var svg = chartWithTitles.exportToSvg();
        expect(svg.node.nodeName).toBe("svg");
        //chart group
        var group1 = svg.get(1);
        expect(group1.node.nodeName).toBe("g");
        var children = group1.children();
        expect(children.length).toBe(5); // 4 side slots + central part
        for (var i = 0; i < 5; i++)
            expect(children[i].node.nodeName).toBe("g");

        var leftGroupChildern = children[0].children();
        expect(leftGroupChildern.length).toBe(2); // axis and Y title
        expect(leftGroupChildern[0].node.nodeName).toBe("g")
        expect(leftGroupChildern[0].children()[0].node.nodeName).toBe("text")
        
        

        var topGroupChildern = children[1].children();
        expect(topGroupChildern.length).toBe(1); // chart title        
        expect(topGroupChildern[0].node.nodeName).toBe("g")
        expect(topGroupChildern[0].children()[0].node.nodeName).toBe("text")

        var bottomGroupChildern = children[2].children();
        expect(bottomGroupChildern.length).toBe(2); // axis and X title
        expect(bottomGroupChildern[1].node.nodeName).toBe("g") // note that title is below the axis, so its index is 1
        expect(bottomGroupChildern[1].children()[0].node.nodeName).toBe("text")
        
    });
    it("legend export", function () {
        var line = chart.polyline("p1", { x: [1, 2, 3], y: [1, 2, 3] });
        var marker = chart.markers("mark", { x: [1, 2, 3], y: [3, 8, 2] });
        var legendsvg = chart.exportLegendToSvg(chart.legend.Host[0]);
        expect(legendsvg.width()).toBe(200);
        expect(legendsvg.height()).toBe(divHeight);
        expect(legendsvg.node.nodeName).toBe("svg");
        expect(legendsvg.children().length).toBe(3);
        expect(legendsvg.get(2).node.nodeName).toBe("g");
        expect(legendsvg.get(0).node.nodeName).toBe("line");
    });
});