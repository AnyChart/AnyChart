[<img src="https://cdn.anychart.com/images/logo-transparent-segoe.png?2" width="234px" alt="AnyChart - Robust JavaScript/HTML5 Chart library for any project">](http://www.anychart.com)

AnyChart Data Visualization Framework
=========

AnyChart is a flexible JavaScript (HTML5, SVG, VML) charting framework that fits any solution in need of data visualization.

## Table of Contents

* [Download and install](#download-and-install)
* [Getting started](#getting-started)
* [Contacts](#contacts)
* [Links](#links)
* [License](#license)

## Download and install

There are several ways to download/install AnyChart.

#### Direct download

All binaries can be downloaded from the [download page](http://www.anychart.com/download/products/).

#### CDN

If you don't want to download and host AnyChart yourself, you can include it from the AnyChart CDN (Content Delivery Network): [https://cdn.anychart.com/](https://cdn.anychart.com/) 

```html
<head>
<script src="https://cdn.anychart.com/js/latest/anychart.min.js"></script>
</head>
```

#### Package managers

You can install AnyChart using **npm**, **bower** or **yarn**:

* `npm install anychart`
* `bower install anychart`
* `yarn install anychart`

## Getting started

The fastest way to start with AnyChart is to include framework into a webpage and write some code. Look at this simple HTML snippet below:

```html
<!doctype html>
<body>
<div id="container" style="width: 500px; height: 400px;"></div>
<script src="https://cdn.anychart.com/js/latest/anychart.min.js" type="text/javascript"></script> 
<script>
    anychart.onDocumentReady(function() {
        // create a pie chart
        var chart = anychart.pie([
            ["Chocolate", 5],
            ["Rhubarb compote", 2],
            ["Crêpe Suzette", 2],
            ["American blueberry", 2],
            ["Buttermilk", 1]
        ]);
        chart.title("Top 5 pancake fillings");
        // set the container where chart will be drawn
        chart.container("container");
        //  draw the chart on the page
        chart.draw();
    });
</script>
</body>
</html>
```

#### Step by step quick start guides

* [AnyChart Quick Start](http://docs.anychart.com/latest/Quick_Start/Quick_Start)
* [AnyStock Quick Start](http://docs.anychart.com/latest/Stock_Charts/Quick_Start)
* [AnyMap Quick Start](http://docs.anychart.com/latest/Maps/Quick_Start)
* [AnyGantt Quick Start](http://docs.anychart.com/latest/Gantt_Chart/Quick_Start)

## Contacts

* Web: [www.anychart.com](www.anychart.com)
* Email: [contact@anychart.com](mailto:contact@anychart.com)
* Twitter: [anychart](https://twitter.com/anychart)
* Facebook: [AnyCharts](https://www.facebook.com/AnyCharts)
* LinkedIn: [anychart](https://www.linkedin.com/company/anychart)

## Links

* [AnyChart Website](http://www.anychart.com)
* [Download AnyChart](http://www.anychart.com/download/)
* [AnyChart Licensing](http://www.anychart.com/buy/)
* [AnyChart Support](http://www.anychart.com/support/)
* [Report Issues](http://github.com/AnyChart/anychart/issues)
* [AnyChart Playground](http://playground.anychart.com)
* [AnyChart Documentation](http://docs.anychart.com)
* [AnyChart API Reference](http://api.anychart.com)
* [AnyChart Sample Solutions](http://www.anychart.com/solutions/)
* [AnyChart Integrations](http://www.anychart.com/integrations/)

## License

[© AnyChart.com - JavaScript charts](http://www.anychart.com). All rights reserved.
