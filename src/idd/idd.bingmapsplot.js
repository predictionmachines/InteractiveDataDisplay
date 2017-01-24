InteractiveDataDisplay.BingMaps = InteractiveDataDisplay.BingMaps || {};

InteractiveDataDisplay.BingMaps.ESRI = InteractiveDataDisplay.BingMaps.ESRI || {};

InteractiveDataDisplay.BingMaps.ESRI.GetWorldTopo = function () {
    function getTilePath(tile) {
        return "http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/" + tile.levelOfDetail + "/" + tile.y + "/" + tile.x;
    }
    return new Microsoft.Maps.TileSource({ uriConstructor: getTilePath });
};

InteractiveDataDisplay.BingMaps.ESRI.GetDeLorme = function () { // DeLorme World Basemap
    function getTilePath(tile) {
        return "http://server.arcgisonline.com/ArcGIS/rest/services/Specialty/DeLorme_World_Base_Map/MapServer/tile/" + tile.levelOfDetail + "/" + tile.y + "/" + tile.x;
    }
    return new Microsoft.Maps.TileSource({ uriConstructor: getTilePath });
};

InteractiveDataDisplay.BingMaps.ESRI.GetWorldImagery = function () { // ESRI World Imagery
    function getTilePath(tile) {
        return "http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/" + tile.levelOfDetail + "/" + tile.y + "/" + tile.x;
    }
    return new Microsoft.Maps.TileSource({ uriConstructor: getTilePath });
};

InteractiveDataDisplay.BingMaps.ESRI.GetOceanBasemap = function () { // Ocean Basemap
    function getTilePath(tile) {
        return "http://services.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/" + tile.levelOfDetail + "/" + tile.y + "/" + tile.x;
    }
    return new Microsoft.Maps.TileSource({ uriConstructor: getTilePath });
};

InteractiveDataDisplay.BingMaps.ESRI.GetNationalGeographicMap = function () { // National Geographic World Map
    function getTilePath(tile) {
        return "http://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/" + tile.levelOfDetail + "/" + tile.y + "/" + tile.x;
    }
    return new Microsoft.Maps.TileSource({ uriConstructor: getTilePath });
};

InteractiveDataDisplay.BingMaps.ESRI.GetWorldShadedRelief = function () { // World Shaded Relief
    function getTilePath(tile) {
        return "http://services.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/" + tile.levelOfDetail + "/" + tile.y + "/" + tile.x;
    }
    return new Microsoft.Maps.TileSource({ uriConstructor: getTilePath });
};

InteractiveDataDisplay.BingMaps.ESRI.GetWorldTerrainBase = function () { // World Terrain Base
    function getTilePath(tile) {
        return "http://services.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/" + tile.levelOfDetail + "/" + tile.y + "/" + tile.x;
    }
    return new Microsoft.Maps.TileSource({ uriConstructor: getTilePath });
};



InteractiveDataDisplay.BingMaps.OpenStreetMap = InteractiveDataDisplay.BingMaps.OpenStreet || {};

InteractiveDataDisplay.BingMaps.OpenStreetMap.GetTileSource = function () {
    function getTilePath(tile) {
        return "http://tile.openstreetmap.org/" + tile.levelOfDetail + "/" + tile.x + "/" + tile.y + ".png";
    }
    return new Microsoft.Maps.TileSource({ uriConstructor: getTilePath });
};



InteractiveDataDisplay.BingMapsPlot = function (div, master) {
    if (!div) return;

    var mapDiv = $('<div style="position: absolute"></div>').prependTo(div);

    this.base = InteractiveDataDisplay.Plot;
    this.base(div, master);

    var that = this;

    if (typeof Microsoft === 'undefined') {
        //BingMaps script wasn't loaded
        $("<p></p>").css("margin", 15).css("word-wrap", "break-word").text("BingMaps script is unavailable. Check your internet connection.").appendTo(div);
    } else {

        var navDiv = undefined;
        var navCanvas = undefined;
        if (that.children.length === 0) {
            navDiv = $('<div style="position: absolute;"></div>').appendTo(div);
            navDiv.css("z-index", InteractiveDataDisplay.ZIndexNavigationLayer);
            navCanvas = $('<canvas></canvas>').appendTo(navDiv);
        }

        var maxLat = 85.05112878;

        this.mapKey = div.attr("data-idd-mapKey");

        var _map = new Microsoft.Maps.Map(mapDiv[0], {
            credentials: that.mapKey,
            mapTypeId: Microsoft.Maps.MapTypeId.aerial,
            enableClickableLogo: false,
            enableSearchLogo: false,
            showCopyright: false,
            showDashboard: false,
            showLogo: false,
            disablePanning: true,
            disableZooming: true,
            width: div.width(),
            height: div.height()
        });

        Object.defineProperty(this, "map", {
            get: function () { return _map; },
            configurable: false
        });

        var bingMapsAnimation = new InteractiveDataDisplay.BingMapsAnimation(_map);

        this.arrange = function (finalRect) {
            InteractiveDataDisplay.BingMapsPlot.prototype.arrange.call(this, finalRect);

            _map.width = finalRect.width;
            _map.height = finalRect.height;
        };

        // Sets the map provided as an argument which is either a tile source (Microsoft.Maps.TileSource, e.g. see InteractiveDataDisplay.BingMaps.OpenStreetMap.GetTileSource),
        // or a map type of Bing Maps (Microsoft.Maps.MapTypeId).
        this.setMap = function (map) {
            _map.setMapType(Microsoft.Maps.MapTypeId.mercator);
            _map.entities.clear();
            if (!map) return;

            if (map instanceof Microsoft.Maps.TileSource) {
                // Construct the layer using the tile source
                var tilelayer = new Microsoft.Maps.TileLayer({ mercator: map, opacity: 1 });
                _map.entities.push(tilelayer);
            } else {
                _map.setMapType(map);
            }
        };

        this.constraint = function (plotRect, screenSize, isPlotScreenChanged) {
            if (isPlotScreenChanged === true) {
                var mapWidth = _map.getWidth();
                var mapHeight = _map.getHeight();

                if (mapWidth <= 1 || mapHeight <= 1)
                    return plotRect;

                bingMapsAnimation.setMapView(plotRect, screenSize);
                mapRect = InteractiveDataDisplay.Utils.getPlotRectForMap(_map);
                return mapRect;
            }
            return plotRect;
        }

        this.arrange = function (finalRect) {
            InteractiveDataDisplay.CanvasPlot.prototype.arrange.call(this, finalRect);

            if (navDiv !== undefined) {
                navDiv.width(finalRect.width);
                navDiv.height(finalRect.height);
                navCanvas[0].width = finalRect.width;
                navCanvas[0].height = finalRect.height;
            }
        }

        bingMapsAnimation.constraint = this.constraint;
        that.navigation.animation = bingMapsAnimation;
        this.selfMapRefresh();
    }
}

InteractiveDataDisplay.BingMapsPlot.prototype = new InteractiveDataDisplay.Plot;