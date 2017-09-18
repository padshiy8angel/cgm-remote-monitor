'use strict';
window.Nightscout.client.init();
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
app.controller('graphController', function ($scope, $http, $interval) {
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
        var left = x + 30 < windowWidth ? x : windowWidth - 30 - 10;
        return left + 'px';
    }

    function tooltipTop(y, chart) {
        var windowheight = chart.prevChartHeight;
        var top = windowheight - y - 8;
        return top + 'px';
    }

    $scope.drawValueLineHor = function (event) {
        var x3 = parseFloat(event.offsetX);
        var yTop = parseFloat(event.offsetY);
        var y3 = null;
        var mils = null;
        var yline = document.getElementById('yline');
        yline.setAttribute("x1", x3);
        yline.setAttribute("x2", x3);
        var recalc = $scope.calc(x3);
        y3 = recalc.y;
        mils = recalc.mills;
        if (y3 != null) {
            var ylineval = recalc.client.ylineval;
            console.log(ylineval);
            var cl;
            if (y3 < 10 && y3 > 4.5) {
                cl = 'green';
            } else if (y3 > 14) {
                cl = 'red';
            } else {
                cl = '#b0b74b'
            }
            ylineval.style("opacity", .9);
            ylineval.style('left', tooltipLeft(x3, recalc.chart));
            ylineval.style('top', tooltipTop(yTop, recalc.chart));
            ylineval.html('<strong>Гликемия:</strong> ' + y3.toFixed(1) + '<br><strong>Время:</strong> ' + (new Date(mils)).toLocaleTimeString());
        }
    };
});


