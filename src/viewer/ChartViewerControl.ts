/// <reference path="plotlist.ts" />
/// <reference path="plotviewer.ts" />
/// <reference path="ViewState.ts" />
module ChartViewer {
    export class ChartViewerControl implements ViewerControl {
        private persistentViewState: any;
        private transientViewState: ViewState;
        private rightPanelExtraShift = 3;
        private navigationPanelShift = 65;
        private minWidthToShowLeftPanel = 540;

        private controlDiv: JQuery;
        private leftPanelContainer: JQuery;
        private rightpanel: JQuery;
        private plotViewer: PlotViewer;
        private plotList = undefined;

        viewState = undefined;

        constructor(container: HTMLElement) {
            var that = this;
            var controlDiv = this.controlDiv = $(container);
            this.persistentViewState = this.viewState = new PersistentViewState();
            this.persistentViewState.initProbes();
            this.transientViewState = new TransientViewState();

            var width = controlDiv.width();
            var height = controlDiv.height();
            if (width === 0) controlDiv.width(400);
            if (height === 0) controlDiv.height(400);

            // loading html for control
            var visControl = $("<div class='dsv-visualizaition-control'></div>");
            controlDiv.append(visControl);
            var leftPanelCont = $("<div class='dsv-leftpanelcontainer'></div>");
            visControl.append(leftPanelCont);
            var rightPanel = $("<div class='dsv-rightpanel'></div>");
            visControl.append(rightPanel);
            var leftPanel = $("<div class='dsv-leftpanel'></div>");
            leftPanelCont.append(leftPanel);
            leftPanel.append($("<div class='plotlist'></div>"));
            rightPanel.append($("<div class='dsv-visualization-preview'></div>"));
            var navigationDiv = $("<div class='dsv-navigation-container'></div>").appendTo(visControl);
            navigationDiv.addClass('no-print');
            // creating hide/show leftpanel button
            var rightpanel = this.rightpanel = controlDiv.find(".dsv-rightpanel");
            var leftpanel = controlDiv.find(".dsv-leftpanel");
            var leftPanelContainer = this.leftPanelContainer = controlDiv.find(".dsv-leftpanelcontainer");
            var hidebutton = $("<div></div>").addClass("dsv-leftpanelhidebutton").appendTo(leftPanelContainer);
            var isLeftpanelShown = true;

            this.plotViewer = new PlotViewer(controlDiv.find(".dsv-visualization-preview"), navigationDiv, this.persistentViewState, this.transientViewState);
            var plotListDiv = controlDiv.find(".plotlist");
            this.plotList = new PlotList(plotListDiv, this.plotViewer, this.persistentViewState, this.transientViewState);
            this.plotList.isEditable = false;
            this.plotList.subscribe(function (args) {
                that.plotViewer.draw(args);
            });
            hidebutton.click(function () {
                if (isLeftpanelShown) {
                    isLeftpanelShown = false;
                    leftpanel.hide();
                    hidebutton.attr("class", "dsv-leftpanelshowbutton");
                } else {
                    isLeftpanelShown = true;
                    leftpanel.show();
                    hidebutton.attr("class", "dsv-leftpanelhidebutton");
                }
                rightpanel.width(controlDiv.width() - leftPanelContainer.width() - that.rightPanelExtraShift - that.navigationPanelShift);
                that.plotViewer.updateLayout();
            });

            if (controlDiv.width() < this.minWidthToShowLeftPanel) {
                leftPanelContainer.hide();
                rightpanel.width(controlDiv.width() - this.rightPanelExtraShift - this.navigationPanelShift);
            } else {
                rightpanel.width(controlDiv.width() - leftPanelContainer.width() - this.rightPanelExtraShift - this.navigationPanelShift);
            }
            $(window).resize(function () { that.updateLayout(); });
            this.updateLayout();
        }

        update(chartInfo: ChartInfo) {
            // Converting plotInfo instances to instances of PlotViewerItem.
            // If display name is missing for a plot, we use its id as display name.
            var plotItems: PlotViewerItems = {};
            for (var id in chartInfo) {
                var plotInfo = chartInfo[id];                
                if (plotInfo != null) {
                    plotItems[id] = {
                        Id: id,
                        Definition: plotInfo
                    };
                    if (plotInfo.displayName === null || typeof plotInfo.displayName === "undefined") {
                        plotInfo = $.extend(false, {}, plotInfo);
                        plotInfo.displayName = id;
                        plotItems[id].Definition = plotInfo;
                    }
                }
                else plotItems[id] = null;
            }
            plotItems = this.plotViewer.draw(plotItems); 
            this.plotList.draw(plotItems);
        }
        
        updateLayout() {
            var widthToSubtract = 0;
            if (this.controlDiv.width() < this.minWidthToShowLeftPanel && this.leftPanelContainer !== undefined)
                this.leftPanelContainer.hide();
            else if (this.leftPanelContainer !== undefined) {
                this.leftPanelContainer.show();
                widthToSubtract = this.leftPanelContainer.width();
            }
            this.rightpanel.width(this.controlDiv.width() - widthToSubtract - this.rightPanelExtraShift - this.navigationPanelShift);
            this.plotViewer.updateLayout();
        }        

        dispose() {
            this.plotList.unsubscribe(this);
            this.controlDiv.children().remove();
        }
    }
}