(function () {


    function screenSize() {
        var w, h; // Объявляем переменные, w - длина, h - высота
        w = (window.innerWidth ? window.innerWidth : (document.documentElement.clientWidth ? document.documentElement.clientWidth : document.body.offsetWidth));
        h = (window.innerHeight ? window.innerHeight : (document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body.offsetHeight));
        return {w: w, h: h};
    }

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
    }]).controller('graphController', function ($scope, $http, $interval) {
        // Options
        $scope.width = screenSize().w - 300;
        $scope.height = screenSize().h - 200;
        // Data
        var stopWatch = false;
        var from = null;
        var to = null;
        $scope.timeng = 6;
        $scope.fromTime = new Date((new Date((new Date).getTime() - $scope.timeng * 60 * 60 * 1000)).setMilliseconds(0));
        $scope.toTime = new Date((new Date).setMilliseconds(0));

        $scope.$watch('timeng', function (val) {
            if (val != null) {
                $scope.fromTime = new Date((new Date((new Date).getTime() - val * 60 * 60 * 1000)).setMilliseconds(0));
                $scope.toTime = new Date((new Date).setMilliseconds(0));
            }
        });

        $interval(function () {
            console.log('wait 5s');
            stopWatch = true;
            $scope.fromTime = new Date((new Date((new Date).getTime() - $scope.timeng * 60 * 60 * 1000)).setMilliseconds(0));
            stopWatch = false;
            $scope.toTime = new Date((new Date).setMilliseconds(0));
        }, 5000);

        $scope.$watch('fromTime', function (newValue) {
            if (!stopWatch) {
                try {
                    from = (new Date(newValue)).getTime();
                    makeNewQuery();
                } catch (err) {
                    from = null;
                }
            }
        });
        $scope.$watch('toTime', function (newValue) {
            if (!stopWatch) {
                try {
                    to = (new Date(newValue)).getTime();
                    makeNewQuery();
                } catch (err) {
                    to = null;
                }
            }
        });
        //$scope.query = '?find[date][$gte]=' + from + '&find[date][$lt]=' + to + '&count=100000';
        function makeNewQuery() {
            if (from != null && to != null) {
                $scope.query = '?find[date][$gte]=' + from + '&find[date][$lt]=' + to + '&count=100000';
            }
        }

        $scope.html = '';
        $scope.$watch('query', function (query) {
            if (query != null) {
                $http({
                    method: 'GET',
                    url: '/api/v1/entries.json' + query
                }).then(function successCallback(response) {
                    var data = [];
                    $scope.max = 0.00;
                    $scope.min = 1000.00;
                    angular.forEach(response.data, function (v) {
                        //console.log(v);
                        var newItem = {
                            label: v.dateString,
                            value: (parseInt(v.sgv) / 18.1).toFixed(1),
                            time: v.date,
                            sgv: v
                        };
                        if (parseFloat(newItem.value) > $scope.max)
                            $scope.max = angular.copy(parseFloat(newItem.value));
                        if (parseFloat(newItem.value) < $scope.min) {
                            $scope.min = angular.copy(parseFloat(newItem.value));
                        }
                        data.push(newItem);
                    });
                    data = data.slice().reverse();
                    var prevSgv = angular.copy(data[data.length - 1]);
                    $scope.maxTime = prevSgv.time;
                    var diff = (new Date()).getTime() - $scope.maxTime;
                    while (diff >= 15 * 60 * 1000) {
                        var newTime = $scope.maxTime + 15 * 60 * 1000;
                        var newItem = {
                            label: (new Date(newTime)).toISOString(),
                            value: prevSgv.value,
                            time: newTime,
                            sgv: prevSgv,
                            color: 'black'
                        };
                        data.push(newItem);
                        $scope.maxTime = newTime;
                        diff = (new Date()).getTime() - $scope.maxTime;
                    }
                    $scope.tmpData = data;
                }, function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
            }
        });
        $scope.$watch('tmpData', function (newVal) {
            if (newVal != null) {
                $scope.data = newVal;
                // Find Maximum X & Y Axis Values - this is used to position the data as a percentage of the maximum
                var lines = '';
                $scope.max = $scope.max + $scope.min;
                var maxIndex = 0;
                angular.forEach($scope.data, function (line, index) {
                    try {
                        line.x1 = (index < 1 ? 1 : index) / $scope.data.length * $scope.width;
                        line.y1 = $scope.data[index < 1 ? 1 : index - 1].value / $scope.max * $scope.height;
                        line.y1sgv = $scope.data[index < 1 ? 1 : index - 1].value;
                        line.x2 = (index + 1) / $scope.data.length * $scope.width;
                        line.y2 = line.value / $scope.max * $scope.height;
                        line.y2sgv = line.value;
                        line.mils1 = $scope.data[index < 1 ? 1 : index - 1].time;
                        line.mils2 = line.time;
                        var lineclass;
                        if (line.color != null) {
                            lineclass = 'line' + line.color;
                        } else if (line.value < 10 && line.value > 4.5) {
                            lineclass = 'linegreen';
                        } else if (line.value > 14) {
                            lineclass = 'linered';
                        } else {
                            lineclass = 'lineyellow'
                        }
                        lines += '<line class="' + lineclass + '" x1="' + line.x1 + '" y1="' + line.y1 + '" '
                        + 'x2="' + line.x2 + '" y2="' + line.y2 + '"></line>';
                    } catch (err) {
                        console.log(index);
                    }
                    maxIndex = index;
                });
                $scope.additionalX = '';
                // Нарисовать линию по 15 ск
                lines += drawXLine(14, maxIndex);
                // Нарисовать линию по 10 ск
                lines += drawXLine(10, maxIndex);
                // Нарисовать линию по 4,5 ск
                lines += drawXLine(4.5, maxIndex);
                // Нарисовать линию по 3 ск
                lines += drawXLine(3, maxIndex);

                $scope.calc = function (x3) {
                    var result = {
                        y: null,
                        mills: null
                    };
                    angular.forEach($scope.data, function (line) {
                        if (line.x1 <= x3 && x3 <= line.x2) {
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
                            var x1 = parseFloat(line.x1);
                            var y1 = parseFloat(line.y1sgv);
                            var x2 = parseFloat(line.x2);
                            var y2 = parseFloat(line.y2sgv);
                            var mils1 = parseInt(line.mils1);
                            var mils2 = parseInt(line.mils2);
                            //console.log('y3 = (x3 - 1) * (y2-y1) / (x2 + x1) + y1');
                            //console.log('y3 = (' + x3 + ' - 1) * (' + y2 + '-' + y1 + ') / (' + x2 + ' + ' + x1 + ') + ' + y1);
                            result.y = (x3 - 1) * (y2 - y1) / (x2 + x1) + y1;
                            result.mills = (x3 - 1) * (mils2 - mils1) / (x2 + x1) + mils1;
                            //console.log(y3);
                        }
                    });
                    return result;
                };
                // Добавить легенду по оси X
                var countPeriod = 6;
                var xLine = '';
                var rasst = $scope.width / countPeriod;
                var startDate = new Date(from);
                xLine += '<div style="width:40px;color:white;position:absolute;left:-20px;">' + startDate.toLocaleString() + '</div>';
                var lastDay = startDate.getDay();
                for (var i = 1; i <= countPeriod; i++) {
                    var newX = i * rasst;
                    var nw = $scope.calc(newX);
                    var newDate = (new Date(nw.mills));
                    var text = newDate.getDay() != lastDay ? newDate.toLocaleString() : newDate.toLocaleTimeString();
                    lastDay = newDate.getDay();
                    xLine += '<div style="width:40px;color:white;position:absolute;left:' + (rasst * i - 20) + 'px;">' + text + '</div>';
                    lines += drawConstYLine(rasst * i);
                }
                $scope.xAse = xLine;
                lines += drawYLine();
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
                        var ylineval = document.getElementById('ylineval');
                        var cl;
                        if (y3 < 10 && y3 > 4.5) {
                            cl = 'green';
                        } else if (y3 > 14) {
                            cl = 'red';
                        } else {
                            cl = '#b0b74b'
                        }
                        ylineval.setAttribute("style", "border-radius:8px;background-color:lightyellow;position:absolute;display:block;left:" + tooltipLeft(x3) + ";color:" + cl + ";top:" + tooltipTop(yTop) + ";");
                        ylineval.innerText = y3.toFixed(1) + '\r\n' + (new Date(mils)).toLocaleString();
                    }
                };
                $scope.dragFunc = function (event) {
                    console.log(event);
                };
                $scope.html = '<svg style="width:' + $scope.width + 'px; height:' + $scope.height
                + 'px;" ng-click="drawValueLineHor($event)" ng-dragstart="dragFunc($event)">'
                + lines
                + '</svg>' + $scope.additionalX;
            }
        });

        function tooltipLeft(x) {
            var windowWidth = $scope.width;
            var left = x + 30 < windowWidth ? x : windowWidth - 30 - 10;
            return left + 'px';
        }

        function tooltipTop(y) {
            var windowheight = $scope.height;
            var top = windowheight - y - 8;
            return top + 'px';
        }

        function drawXLine(value, maxIndex) {
            $scope.additionalX += '<div style="color:white;position:absolute;display:block;left:-21px;top:'
            + tooltipTop(value / $scope.max * $scope.height) + '">' + value + '</div>';
            $scope.additionalX += '<div style="color:white;position:absolute;display:block;left:' + ($scope.width)
            + 'px;top:' + tooltipTop(value / $scope.max * $scope.height) + '">' + value + '</div>';
            return '<line class="graphlineval" x1="0"'
                    + 'y1="' + value / $scope.max * $scope.height + '"'
                    + 'x2="' + (maxIndex + 1) / $scope.data.length * $scope.width + '"'
                    + 'y2="' + value / $scope.max * $scope.height + '"></line>';
        }

        function drawYLine() {
            return '<line id="yline" x1="0"'
                    + 'y1="0"'
                    + 'x2="0"'
                    + 'y2="' + $scope.height + '"></line><div id="ylineval"></div>';
        }

        function drawConstYLine(x1) {
            return '<line class="graphlineval" x1="' + x1 + '"'
                    + 'y1="0"'
                    + 'x2="' + x1 + '"'
                    + 'y2="' + $scope.height + '"></line>';
        }

        // End Controller
    });

})();