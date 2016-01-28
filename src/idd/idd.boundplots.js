InteractiveDataDisplay = InteractiveDataDisplay || {};
InteractiveDataDisplay.Binding = InteractiveDataDisplay.Binding || {};

(function () {
    // Table of bound plots: array of pairs (plot1, plot2, binding)
    var plotsBindingH = [];
    var plotsBindingV = [];
    var plotsReachableH = []; // array [{ plot, reachable : [plot...] }]
    var plotsReachableV = []; // array [{ plot, reachable : [plot...] }]

    var indexOf = function (plotsBinding, plot1, plot2) {
        for (var i = 0, length = plotsBinding.length; i < length; i++) {
            var p = plotsBinding[i];
            if ((p.plot1 === plot1 || p.plot1 === plot2) &&
                (p.plot2 === plot1 || p.plot2 === plot2)) return i;
        }
        return -1;
    };

    // edges is array of {plot1, plot2}
    var getReachable = function (plot, edges) {
        var reachable = [];
        edges = edges.slice(0); // copy since we will modify the array

        var queue = [plot];
        while (queue.length > 0) {
            var p = queue.shift(); // take next reachable node 
            if (p != plot && reachable.indexOf(p) < 0) {
                reachable.push(p);
            }

            // looking for edges (p,x) and (x,p) and pushing x to a queue
            for (var i = edges.length; --i >= 0;) {
                var edge = edges[i];
                var p2 = null;
                if (edge.plot1 === p) p2 = edge.plot2;
                else if (edge.plot2 === p) p2 = edge.plot1;
                if (p2) {
                    queue.push(p2);
                    edges.splice(i, 1);
                }
            }
        }
        return reachable;
    };

    var buildReachability = function (plotsBinding, plotsReachable) {
        // building list of plots
        var plots = [];
        for (var i = 0, length = plotsBinding.length; i < length; i++) {
            var p = plotsBinding[i];
            if (plots.indexOf(p.plot1) < 0)
                plots.push(p.plot1);
            if (plots.indexOf(p.plot2) < 0)
                plots.push(p.plot2);
        }

        plotsReachable.splice(0);
        for (var i = 0, length = plots.length; i < length; i++) {
            var reachable = getReachable(plots[i], plotsBinding);
            plotsReachable.push({ plot: plots[i], reachable: reachable });
        }
    };

    // Binds visible rectangles of two plots.
    // filter is either "v" (binds vertical ranges), "h" (binds horizontal ranges), or "vh" (default, binds both ranges).
    // Remarks.
    // Master plots of given plots are bound.
    // Binding is asynchronous and bi-directional.
    // Idempotent operation. Several "bindPlots" for same plots are equivalent to a single "bindPlots" and return same instance.
    // Thus, destroying the binding once removes the binding independingly on how many times "bindPlots" were called.
    InteractiveDataDisplay.Binding.bindPlots = function (plot1, plot2, filter) {
        if (filter == undefined || filter == "vh") {
            var b1 = InteractiveDataDisplay.Binding.bindPlots(plot1, plot2, "v");
            var b2 = InteractiveDataDisplay.Binding.bindPlots(plot1, plot2, "h");
            var isDestroyed = false;
            return {
                destroy: function () {
                    if (isDestroyed) return;
                    b1.destroy();
                    b2.destroy();
                    isDestroyed = true;
                }
            };
        }
        if (filter != "v" && filter != "h") throw "Parameter filter is incorrect";
        if (!plot1) throw "plot1 is incorrect";
        if (!plot2) throw "plot2 is incorrect";
        plot1 = plot1.master;
        plot2 = plot2.master;
        if (plot1 === plot2) throw "plot1 equals plot2";

        var plotsBinding = filter == "v" ? plotsBindingV : plotsBindingH;
        var k = indexOf(plotsBinding, plot1, plot2);
        if (k >= 0) return plotsBinding[k].binding;

        var reachability = filter == "v" ? plotsReachableV : plotsReachableH;
        var isDestroyed = false;
        var b = {
            plot1: plot1,
            plot2: plot2,
            binding: {
                destroy: function () {
                    if (isDestroyed) return;
                    var k = indexOf(plotsBinding, plot1, plot2);
                    if (k) plotsBinding.splice(k, 1);
                    buildReachability(plotsBinding, reachability);
                    isDestroyed = true;
                }
            }
        };
        plotsBinding.push(b);

        buildReachability(plotsBinding, reachability);
        plot1.requestUpdateLayout();
        return b.binding;
    };

    InteractiveDataDisplay.Binding.getBoundPlots = function (plot) {
        var reach = {
            h: [],
            v: []
        };
        for (var i = 0, length = plotsReachableH.length; i < length; i++) {
            if (plotsReachableH[i].plot === plot) {
                reach.h = plotsReachableH[i].reachable;
                break;
            }
        }
        for (var i = 0, length = plotsReachableV.length; i < length; i++) {
            if (plotsReachableV[i].plot === plot) {
                reach.v = plotsReachableV[i].reachable;
                break;
            }
        }
        return reach;
    };
})();