var window_width = window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth;

var draw_Fx = function(chart, Df, Fx, color, name, thickness){
    var d = Df[1] - Df[0];
    var step = d/window_width;
    var rounded_step = parseFloat(step.toFixed(4));

    if (rounded_step == 0) rounded_step = parseFloat(step.toFixed(8));
    //rounded_step = rounded_step * 3;
    var points = [];
    var points_len = Math.round(d/rounded_step);

    var current = Df[0];
    for (var i = 0; i < points_len; i++) {

        points.push([current, Fx(current)]);
        current = current + rounded_step
    }
    chart.line(points).stroke(thickness + ' ' + color).name(name).markers(null).hoverStroke(function() {
        return this['sourceColor'];
    });
};
var tt;


var make_polar_points = function(minX, maxX, step, func){
    var points = [];
    var current = minX;
    while (current <= maxX ){
        points.push([current, func(current)]);
        current = current + step;
    }
    tt = points;
    return anychart.data.set(points);
};