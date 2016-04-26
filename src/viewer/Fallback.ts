/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="Utils.ts" />
/// <reference path="PlotRegistry.ts" />
declare var InteractiveDataDisplay: any;
declare var Microsoft: any;

module ChartViewer {
    PlotRegistry["fallback"] = {
        initialize(plotDefinition: PlotInfo, viewState: ViewState, chart: IDDPlot) {
            var div = $("<div></div>")
                .attr("data-idd-name", plotDefinition.displayName)
                .appendTo(chart.host);
            var plot = new FallbackPlot(div, chart.master);
            chart.addChild(plot);
            return [plot];
        },

        draw(plots: IDDPlot[], plotDefinition: PlotInfo) {        
            var drawArgs = {
                kind: plotDefinition.kind,
                error: plotDefinition["error"]
            }
            plots[0].draw(drawArgs);
            
        }
    }

    export function FallbackPlot(div, master) {
        var that = this;

        // Initialization (#1)
        var initializer = InteractiveDataDisplay.Utils.getDataSourceFunction(div, InteractiveDataDisplay.readCsv);
        var initialData = initializer(div);

        this.base = InteractiveDataDisplay.CanvasPlot;
        this.base(div, master);

        var _kind;
        var _error;
        if (initialData) _kind = initialData.kind;
        this.draw = function (data) {
            _kind = data.kind;
            _error = data.error;
            this.fireAppearanceChanged('error');
            
            
        };
        // Returns 4 margins in the screen coordinate system
        this.getLocalPadding = function () {
            return { left: 0, right: 0, top: 0, bottom: 0 };
        };

        this.renderCore = function (plotRect, screenSize) {
        };

        this.getLegend = function () {
            var that = this;
            var nameDiv = $("<span></span>");
            var contentDiv = $("<div class='plotcard-error'></div>");
            var setName = function () {
                nameDiv.text(that.name);
            }
            setName();
            var content = "";
            var setContent = function () {
                var content = "";
                if (_error) content = _error;
                else if (_kind) content = 'kind "' + _kind + '" is unknown';
                else content = "Error plot definition!";
                contentDiv.text(content);
            }
            setContent();

            this.host.bind("appearanceChanged",
                function (event, propertyName) {
                    if (!propertyName || propertyName == "error")
                        setContent();
                    if (!propertyName || propertyName == "name")
                        setName();
                });

            var that = this;

            var onLegendRemove = function () {
                that.host.unbind("appearanceChanged");

                div[0].innerHTML = "";
                div.removeClass("idd-legend-item");
            };

            return { name: nameDiv, legend: { thumbnail: undefined, content: contentDiv }, onLegendRemove: onLegendRemove };
        };
    }
    FallbackPlot.prototype = new InteractiveDataDisplay.CanvasPlot;
}