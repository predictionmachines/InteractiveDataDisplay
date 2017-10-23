/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/jqueryui/jqueryui.d.ts" />

module InteractiveDataDisplay {
    export function createSmallProbe (jqDiv, num?, fill?, scale?) {
        jqDiv.empty();

        var canvasScale = scale !== undefined ? scale : 1;

        var canvas = $("<canvas width='" + (40 * canvasScale) + "' height='" + 40 * canvasScale + "'></canvas>").appendTo(jqDiv);
        var ctx = (<HTMLCanvasElement>canvas.get(0)).getContext("2d");
        ctx.globalAlpha = 0.9;
        var img = new Image();   // Create new img element
        img.onload = function () {
            ctx.drawImage(img, 0, 0, 40 * canvasScale, 40 * canvasScale);
            if (num !== undefined) {
                ctx.fillStyle = "white";
                var fontsize = (num < 10 ? 14 : 11) * canvasScale;
                ctx.font = fontsize + "px Arial";
                var offsetX = (num < 10 ? 16 : 13) * canvasScale;
                ctx.fillText(num, offsetX, 20 * canvasScale);
            }
        };
        img.src = fill ? 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwgAADsIBFShKgAAAABh0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMC45bDN+TgAAApdJREFUaEPtWc1KW0EUDrjL+9RVN2ZVNC1SaBdREewmYkW00NI+QVEkxJ+2/iBq1KX2CVrJM3Tj1ifIG9yebzhnvFxO4iR3Zm4C94Nvk8yc7zs/czOXVEower3eFLHqyCneVjxghk11iYkjsbbYRCDOJqzxfw+Pyf5NdyCxRtbz3viJQJDFrfG9624yv36STC8eDiTWYK2SSJwkIMSCxkSrc5/MrOyrZgextnKQtK/u04mETwICLGSEl75equaG4fK3TpwkEJgFjGB97ZdqaBS++XgcNgkE5MDezQuDJkHB8KQwAj7Gph8z41Rl+XxAJYim+jiwmrBP4mBzAn66QEFs9Ud52gzL2ocDf11ABYim+nh2a4IhCC1OIF8XaLOtvsuPlOXCnttnffh249RPFyQBXAE0oZCEZvwEHKr8wrETxSTgkWUCQJlADhaTQHmIn+g1Afyo4LaoCWnUquxaeTBzM82VgL1K7F78UcVCsHX5V8znv9BRgOhj5GV8BJIAWvpu60wV9EloeBkfAQWxYxSjC6nq5x8fAQWyXXjV/KEK+yBie62+AJUgmi6EfC/w9h6ggQLaLsyu+n+pR8wg1RegIsRgZyHI7GdBgW0XGp/PVSOjsPHlImz1BagM0XsXolRfQAK2C5vbd6qhYYgYUaovQIWIpgsQrq8dqcZciL0p8+GrL4AQC+YapaijkwUJ2lHa2vmtGhxE7Ik6OlmgYkQ7Su8/ud+TsLaQ0ckCwmzAGHq5/PydH2vGwrwABtiI0zWj0LnvBzJiz8PG91vVOIjvUtWPP/f9gEoS7Shp/yHgs7EanSxgiI0Zo3OrP615/KMz1uYFMMYGjeHXzbbhRJgXwCAbFdOTY14Ao0Qc7DQnw3yJoVCp/AcXkU+yAO498gAAAABJRU5ErkJggg=='
            :'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwgAADsIBFShKgAAAABh0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMC45bDN+TgAAAylJREFUaEPVmdtOMjEUhX0Wn9CHwkPQeIxwwQ0SD1eaqIkHghEidxD1Dfrvb0KT+ScLpu0UEy6+xL1ou9fedGbKuNVqtTYaKW4SUkzl9/d329ipYVvNTUWKsWBqYW5guBoYk60QKYaCiYWZwc/PjxuNRu729tZdXl66drvtdnd3C/gbjc8+Pj4cY5mzmNuoECmGQGJv/PHx0R0fHzvTg2Ds09NTuZDkIqRYhzf/9fXlzs/PpckQLi4u3HQ6bVSEFFfhzb+/v7v9/X1pLAbWGA6HyUVIcRll8+xt07LAWqlFSFHhzbNtcnS+CmumbCcpKmzRHS66Jnu+Dq6JxYW9Y7H0UUWKVegIneFuY/FaeX5+jvoWpFiFjtCZmFtlKicnJ1HfghTL0Ak6wkPK4iAODg6CtGXwsCMnuS2WvjxSLEMnjOIpavGfcHd3RwFB34IUy/gCOApYvJKQLoeM6XQ6+QvgPGPxn3B4eJi/gJwPrjrIlb2Avb09mWwdkCt7AUdHRzLZOiBX9gK63a5MVibXRUyu7AVwa7P4T8h9Gy0eZJwWLQ5CdTmk856Yk6kUq9CJ7+/vKBOpkINc5LRY+ikjxSosZrh+vy+T5oQc5MpdQLGNPj8/ZdKckINc5LRY+ikjRQUdMYozu8VrgbXJQS6LpY8qUlTQEWPw8vIik+fg9fU1qvsgxWXQGc7qp6en0kATzs7Oon+NgRSXQWfo0NvbmzTRBF4UsDY5LJb5FVJcBR0yiiOvxVmIOT5XkeIq6JAxmEwm0kwKrMWarG2xzLsMKdZBpwx3fX0tDcVwc3OT3H2QYh10yhjM5/NGp1TmsgZrsaZpMt8qpBiCLyLmjFSlyStFjxRDscTFVrq6upIGV8Ec5rKGxXL9EKQYCp0ziq0U+3q96dbxSDEGXwRnmJDfzYwZj8dZzIMUY/FF3N/fS9NlGJPLPEgxBTNUHDN6vZ40Dnxm4xrv+zJSTIGOGoPZbFa83zTtP9D4jDGMZU4OpJiKL6L6PwT+RsttHqTYBF8EhzOLC1IPaiFIsSm+iIeHBwfrMg9SzMGiCB50sBbzIMVNQoqbhBQ3h9bWP/HfsYvIwP9AAAAAAElFTkSuQmCC';
    };

    export function ProbePull(hostDiv, d3Div) {
        var _host = hostDiv;

        var draggable = $("<div></div>").addClass("dragPoint").addClass("probe").appendTo(_host);
        draggable.draggable({
            containment: "document",
            scroll: false,
            zIndex: 2500,
            helper: function () {
                var hdr = $("<div></div>").addClass("dragPoint");
                createSmallProbe(hdr);
                return hdr;
            },
            appendTo: d3Div
        });

        draggable.mousedown(function (e) {
            e.stopPropagation();
        });
    };

    export function OnScreenNavigation(div, d3Chart, persistentViewState) {
        var that = this;
        InteractiveDataDisplay.NavigationPanel(d3Chart, div, 'https://github.com/predictionmachines/InteractiveDataDisplay/wiki/UI-Guidelines#chartviewer');
        var legendViewer = div.find('.idd-onscreennavigation-showlegend');
        legendViewer.remove();
        legendViewer = div.find('.idd-onscreennavigation-hidelegend');
        legendViewer.remove();

        var hideShowLegend = $('<div></div>').addClass("idd-onscreennavigation-hidelegend").prependTo(div);

        var lockNavigation = div.find('.idd-onscreennavigation-navigationlockpressed');
        if (persistentViewState.isNavigationPanelOpen) $(lockNavigation).click();
        $(lockNavigation).bind('classChanged', function () {
            persistentViewState.isNavigationPanelOpen = $(this).hasClass('idd-onscreennavigation-navigationlock');
        });

        var logSwitcher = div.find('.idd-onscreennavigation-logscale');
        for (var i = 0; i < persistentViewState.isLogAxis; i++)
            $(logSwitcher).click();
        $(logSwitcher).on('axisChanged', function (event, state) {
            persistentViewState.isLogAxis = state;
        });
    }
}