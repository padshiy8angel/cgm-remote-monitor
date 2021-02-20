'use strict';

$(document).on('online', function() {
	console.log('Application got online event, reloading');
	window.location.reload();
});

$(document).ready(function() {
	console.log('Application got ready event');
	window.Nightscout.client.init();
});

var TOOLTIP_TRANS_MS = 200;
var app = angular.module('graphApp', ['angular-loading-bar']);
app.directive('compile', ['$compile', function ($compile) {
    return function (scope, element, attrs) {
        scope.$watch(
                function (scope) {
                    return scope.$eval(attrs.compile);
                },
                function (value) {
                    element.html(value);
                    $compile(element.contents())(scope);
                }
        )
    };
}]);
app.controller('primaryCtrl', function ($scope) {
    $scope.hideTooltip = function ( ) {
        window.Nightscout.client.ylineval.transition()
                .duration(TOOLTIP_TRANS_MS)
                .style('opacity', 0);
        var yline = document.getElementById('yline');
        yline.setAttribute("x1", 0);
        yline.setAttribute("x2", 0);
    };
});
app.controller('graphController', function ($scope) {
    $scope.calc = function (x3) {
        var client = window.Nightscout.client;
        var utils = client.utils;
        var chart = client.chart;
        var result = {
            y: null,
            mills: null,
            chart: chart,
            client: client
        };
        var stop = false;
        angular.forEach(client.entries, function (line, index) {
            var prev = client.entries[index];
            var next = client.entries[index + 1] != null ? client.entries[index + 1] : client.entries[index];
            if (chart.xScale(prev.mills) <= x3 && x3 <= chart.xScale(next.mills) && !stop) {
                // Построить функцию данной линии
                // y1 = k * x1 + b
                // y2 = k * x2 + b
                // b = y1 - k * x1
                // k = (y2 - b) / x2
                // k = (y2 - y1 - k * x1) / x2
                // k * x2 = y2 - y1 - k * x1
                // k * x2 + k * x1 = y2 - y1
                // k = (y2 - y1) / (x2 + x1)
                // b = y1 - (y2 - y1) / (x2 + x1)
                // y3 = ((y2 - y1) / (x2 + x1)) * x3 + y1 - (y2 - y1) / (x2 + x1)
                // y3 = (x3 - 1) * (y2-y1) / (x2 + x1) + y1
                var x1 = parseFloat(chart.xScale(prev.mills));
                var y1 = parseFloat(utils.scaleMgdl(prev.mgdl));
                var x2 = parseFloat(chart.xScale(next.mills));
                var y2 = parseFloat(utils.scaleMgdl(next.mgdl));
                var mils1 = parseInt(prev.mills);
                var mils2 = parseInt(next.mills);
                //console.log('y3 = (x3 - 1) * (y2-y1) / (x2 + x1) + y1');
                //console.log('y3 = (' + x3 + ' - 1) * (' + y2 + '-' + y1 + ') / (' + x2 + ' + ' + x1 + ') + ' + y1);
                result.y = (x3 - 1) * (y2 - y1) / (x2 + x1) + y1;
                result.mills = (x3 - 1) * (mils2 - mils1) / (x2 + x1) + mils1;
                //console.log(y3);
                stop = true;
            }
        });
        return result;
    };

    function tooltipLeft(x, chart) {
        var windowWidth = chart.prevChartWidth;
        var left = x + 150 < windowWidth ? x : windowWidth - 150 - 10;
        return left + 'px';
    }

    function tooltipTop(y, chart) {
        var top = y + 15;
        return top + 'px';
    }

    $scope.drawValueLineHor = function (event) {
        var x3 = parseFloat(event.offsetX);
        var yTop = parseFloat(event.offsetY);
        var yline = document.getElementById('yline');
        yline.setAttribute("x1", x3);
        yline.setAttribute("x2", x3);
        var recalc = $scope.calc(x3);
        var y3 = recalc.y;
        var mils = recalc.mills;
        if (y3 != null) {
            var ylineval = recalc.client.ylineval;
            ylineval.transition().duration(TOOLTIP_TRANS_MS).style("opacity", .9);
            ylineval.style('left', tooltipLeft(x3, recalc.chart));
            ylineval.style('top', tooltipTop(event.pageY, recalc.chart));
            ylineval.html('<strong>Гликемия:</strong> ' + y3.toFixed(1) + '<br><strong>Время:</strong> ' + (new Date(mils)).toLocaleTimeString());
        }
    };
});
