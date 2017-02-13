[<img src="https://cdn.anychart.com/images/logo-transparent-segoe.png?2" width="234px" alt="AnyChart - Robust JavaScript/HTML5 Chart library for any project">](http://www.anychart.com)

AnyChart Data Visualization Framework
=========

AnyChart is a flexible JavaScript (HTML5, SVG, VML) charting framework that fits any solution in need of data visualization.

## Table of Contents

* [Download and install](#download-and-install)
* [Getting started](#getting-started)
* [Using AnyChart in Node.js](#using-anychart-in-nodejs)
* [Build and debug](#build-and-debug)
* [Contribution guide](#contribution-guide)
* [Package directory](#package-directory)
* [Contacts](#contacts)
* [Links](#links)
* [License](#license)

## Download and install

There are several ways to download/install AnyChart.

#### Direct download

All binaries are located in [dist](https://github.com/AnyChart/AnyChart/tree/master/dist) folder.

#### CDN

If you don't want to download and host AnyChart yourself, you can include it from the AnyChart CDN (Content Delivery Network): [https://cdn.anychart.com/](https://cdn.anychart.com/) 

```html
<head>
<script src="https://cdn.anychart.com/js/latest/anychart-bundle.min.js"></script>
</head>
```

#### Package managers

You can install AnyChart using **npm**, **bower** or **yarn**:

* `npm install anychart`
* `bower install anychart`
* `yarn add anychart`

## Getting started

The fastest way to start with AnyChart is to include framework into a webpage and write some code. Look at this simple HTML snippet below:

```html
<!doctype html>
<body>
<div id="container" style="width: 500px; height: 400px;"></div>
<script src="https://cdn.anychart.com/js/latest/anychart-bundle.min.js" type="text/javascript"></script>
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

## Using AnyChart in Node.js

To use AnyChart in [Node.js](https://nodejs.org) please see [https://github.com/AnyChart/AnyChart-NodeJS](https://github.com/AnyChart/AnyChart-NodeJS)

## Build and debug

#### Dependencies

AnyChart uses several third-party libraries and tools to work with JavaScript and CSS.

* [GraphicsJS](http://www.graphicsjs.org/) - High-performance SVG/VML drawing library.
* [Google Closure Library](https://github.com/google/closure-library) - powerful, low-level JavaScript library.
* [Google Closure Compiler](https://github.com/google/closure-compiler) - compiles JavaScript code to better JavaScript.
* [lesscpy](https://github.com/lesscpy/lesscpy) - Python LESS Compiler. Used to compile and minify AnyChart UI css.

#### Building options

`build.py` python script is used to work with AnyChart project. You need to install python to use it. 

To see all available options of the build script use `-h` or `--help` command:

`./build.py -h`.

To see command options use:

`./build.py <command_name> -h`

To install all dependencies use the `deps` command:

`./build.py deps`.

After running this command you can compile the project using the `compile` command:

`./build.py compile`

This compiles production version of **anychart-bundle**  and puts it into the `out` folder.

To compile other modules use `-m` or `--module` option. To see all available modules see the description of `-m` option in the `compile` command help:

`./build.py compile -h`

To create a dev build for the debug purposes use `-d` or `--develop` option:

`./build.py compile -d`

The `-df` option generates **property renaming report**, **variable renaming report**, and **source map location mapping** files:

`./build.py compile -df`

Source map maps minified code to source code. Read more about using [source maps in Chrome](https://developers.google.com/web/tools/chrome-devtools/javascript/source-maps) or [source maps in Firefox](https://developer.mozilla.org/en-US/docs/Tools/Debugger/How_to/Use_a_source_map).

## Contribution guide

To contribute to AnyChart project please:

* Fork AnyChart repository.
* Create a branch from the `develop` branch.
* Make any changes you want to contribute.
* Create a pull request against the `develop` branch.

[GitHub documentation: Forking repositories](https://help.github.com/articles/fork-a-repo/).  
[GitHub documentation: Collaborating using pull requests](https://help.github.com/categories/collaborating-with-issues-and-pull-requests/).

Please, note:  
1. AnyChart bears no responsibility for the code written by third-party developers until pull request is accepted.  
2. After pull request is accepted the author of pull request sign over all rights to the code to AnyChart.  

## Package directory

```
├── css
│   ├── anychart.less
│   ...
├── dist
│   ├── json-schema.json
│   ├── xml-schema.xsd
│       ...
├── src
│   ├── charts
│   ├── core
│   ├── modules
│   ├── themes
│       ...
│   README.md
│   LICENSE
│   ...
```

#### css

The `css` folder contains  **.less** CSS files that are compiled into one **.css** file.

#### src

The `src` folder contains AnyChart source code files organized according to the project structure. For example:

* `charts` subfolder contains chart classes
* `core` subfolder contains core classes
* `modules` subfolder contains modules 
* `themes` contains themes

#### dist

The `dist` folder contains binaries and JSON/XML Schemas.

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
