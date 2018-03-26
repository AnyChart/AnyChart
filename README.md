[<img src="https://cdn.anychart.com/images/logo-transparent-segoe.png?2" width="234px" alt="AnyChart - Robust JavaScript/HTML5 Chart library for any project">](https://www.anychart.com)
[<img alt="AnyChart Travis Build" src="https://img.shields.io/travis/AnyChart/AnyChart.svg" align="right">](https://travis-ci.org/AnyChart/AnyChart)
[<img alt="AnyChart NPM Version" src="https://img.shields.io/npm/v/anychart.svg" align="right">](https://www.npmjs.com/package/anychart)
[<img alt="AnyChart Releases" src="https://img.shields.io/github/release/AnyChart/AnyChart.svg" align="right">](https://www.anychart.com/products/anychart/history)
[<img alt="AnyChart Download" src="https://img.shields.io/npm/dt/anychart.svg" align="right">](https://www.anychart.com/download/)


AnyChart Data Visualization Framework
=========

AnyChart is a flexible JavaScript (HTML5, SVG, VML) charting framework that fits any solution in need of data visualization.


## Table of Contents

* [Download and install](#download-and-install)
* [Getting started](#getting-started)
* [Plugins](#plugins)
* [Using AnyChart with TypeScript](#using-anychart-with-typescript)
* [Using AnyChart with ECMAScript 6](#using-anychart-with-ecmascript-6)
* [Technical Integrations](#technical-integrations)
* [Contribution guide](#contribution-guide)
* [Build and debug](#build-and-debug)
* [Module system](#module-system)
* [Package directory](#package-directory)
* [Contacts](#contacts)
* [Links](#links)
* [License](#license)

## Download and install

There are several ways to download/install AnyChart.

#### Direct download

All binaries are located in [dist](https://github.com/AnyChart/AnyChart/tree/master/dist) folder.

#### CDN

If you don't want to download and host AnyChart yourself, you can include it from the AnyChart CDN (Content Delivery Network): [https://www.anychart.com/download/cdn](https://www.anychart.com/download/cdn) 

```html
<head>
<script src="https://cdn.anychart.com/releases/v8/js/anychart-base.min.js"></script>
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
<script src="https://cdn.anychart.com/releases/v8/js/anychart-base.min.js" type="text/javascript"></script>
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

* [AnyChart Quick Start](http://docs.anychart.com/Quick_Start/Quick_Start)
* [AnyStock Quick Start](http://docs.anychart.com/Stock_Charts/Quick_Start)
* [AnyMap Quick Start](http://docs.anychart.com/Maps/Quick_Start)
* [AnyGantt Quick Start](http://docs.anychart.com/Gantt_Chart/Quick_Start)

## Plugins

AnyChart provides wide variety of [plugins](https://www.anychart.com/plugins/) for different kind of technologies, which includes:

* [AngularJS v1.x](https://www.anychart.com/plugins/angularjs-v1x-charts/)
* [AngularJS v2.x](https://www.anychart.com/plugins/angularjs-v2x-charts/)
* [React](https://www.anychart.com/plugins/react-charts/)
* [Ember](https://www.anychart.com/plugins/ember-charts/)
* [Meteor](https://www.anychart.com/plugins/meteor-charts/)
* [NodeJS](https://www.anychart.com/plugins/nodejs-charts/)
* [Qlik](https://www.anychart.com/plugins/qlik-charts/)
* [jQuery](https://www.anychart.com/plugins/jquery-charts/)

## Using AnyChart with TypeScript

You can use AnyChart in your TypeScript projects - we have definition file for our library which you can find in [distribution folder](https://github.com/AnyChart/anychart/tree/master/dist/index.d.ts).
Please, take a look at [webpack and typescript integration](https://github.com/anychart-integrations/webpack-typescript-example) example for more details.

## Using AnyChart with ECMAScript 6
You can use AnyChart in your ECMAScript 6 projects over two ways:

#### Plain ECMAScript 6
To add AnyChart on a page use `<script>` section with `type="module"` attribute.
```
<script type="module">
    import '_localpath_to_anychart/anychart-bundle.min.js'
    
    // regular AnyChart code here
</script>
```
For more details, take a look at [AnyChart ES6](https://github.com/anychart-integrations/anychart-es6-example) example.

#### Bundling tools and Module Loaders
You can use AnyChart with any bundling tool or module loader such as WebPack, Browserify, Require.js and others.
For more details, take a look at [AnyChart Webpack](https://github.com/anychart-integrations/anychart-es6-webpack) example.

## Technical Integrations

AnyChart can run on any platform and with any database. [These samples](https://www.anychart.com/integrations/) were created to demonstrate how AnyChart can be easily integrated into your environment.
All examples are distributed under an Apache 2.0 License and can be customized to your application. If you are interested in a particular integration not listed here, please [contact us](https://www.anychart.com/support/).
<table>
<tbody>
<tr>
  <td><a href="https://www.anychart.com/integrations/asp-net-c-sharp-mysql-charts/">ASP.NET, C# and MySQL</a></td>
  <td><a href="https://www.anychart.com/integrations/asp-net-vb-mysql-charts/">ASP.NET, VB.NET and MySQL</a></td>
  <td><a href="https://www.anychart.com/integrations/asp-net-signalr-mysql-charts/">ASP.NET, C#, SignalR and MySQL</a></td>
</tr>
<tr>
  <td><a href="https://www.anychart.com/integrations/golang-revel-mysql-charts/">Go, Revel and MySQL</a></td>
  <td><a href="https://www.anychart.com/integrations/golang-http-mysql-charts/">Go and MySQL</a></td>
  <td><a href="https://www.anychart.com/integrations/java-jsp-jdbc-mysql-charts/">Java Servlets, Maven, JDBC, JSP and MySQL</a></td>
</tr>
<tr>
  <td><a href="https://www.anychart.com/integrations/nodejs-socket-io-mongodb-charts/">NodeJS and MongoDB using socket.io</a></td>
  <td><a href="https://www.anychart.com/integrations/java-spring-hibernate-mysql-charts/">Java Spring, Maven, Hibernate and MySQL</a></td>
  <td><a href="https://www.anychart.com/integrations/julia-http-mysql-charts/">Julia and MySQL</a></td>
</tr>
<tr>
  <td><a href="https://www.anychart.com/integrations/nodejs-express-mongodb-charts/">NodeJS Express, Jade and MongoDB</a></td>
  <td><a href="https://www.anychart.com/integrations/php-symfony-mysql-charts/">PHP, Symfony and MySQL</a></td>
  <td><a href="https://www.anychart.com/integrations/php-laravel-mysql-charts/">PHP, Laravel and MySQL</a></td>
</tr>
<tr>
  <td><a href="https://www.anychart.com/integrations/php-slim-mysql-charts/">PHP, Slim and MySQL</a></td>
  <td><a href="https://www.anychart.com/integrations/perl-catalyst-basic-charts/">Perl, Catalyst Web Framework and MySQL</a></td>
  <td><a href="https://www.anychart.com/integrations/python-flask-mysql-charts/">Python, Flask and MySQL</a></td>
</tr>
<tr>
  <td><a href="https://www.anychart.com/integrations/python-django-mysql-charts/">Python, Django and MySQL</a></td>
  <td><a href="https://www.anychart.com/integrations/r-shiny-mysql-charts/">R, Shiny and MySQL</a></td>
  <td><a href="https://www.anychart.com/integrations/ruby-sinatra-mysql-charts/">Ruby, Sinatra and MySQL</a></td>
</tr>
<tr>
  <td><a href="https://www.anychart.com/integrations/ruby-rails-mysql-charts/">Ruby on Rails and MySQL</a></td>
  <td><a href="https://www.anychart.com/integrations/scala-akka-http-mysql-charts/">Scala, Akka and MySQL</a></td>
  <td><a href="https://www.anychart.com/integrations/scala-play-mysql-charts/">Scala, Play and MySQL</a></td>
</tr>
</tbody>
</table>

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

This compiles production version of **anychart-bundle** and **all** modules and puts them into the `out` folder. You can read more about modules in our [Modules](https://docs.anychart.com/Quick_Start/Modules) article.

To create a dev build for the debug purposes use `-d` or `--develop` option:

`./build.py compile -d`

The `-df` option generates **property renaming report**, **variable renaming report**, and **source map location mapping** files:

`./build.py compile -df`

Source map maps minified code to source code. Read more about using [source maps in Chrome](https://developers.google.com/web/tools/chrome-devtools/javascript/source-maps) or [source maps in Firefox](https://developer.mozilla.org/en-US/docs/Tools/Debugger/How_to/Use_a_source_map).

## Module system
AnyChart since v8.0.0 is structured as a modules, so you can use only what you need. Please look at our article [Modules](https://docs.anychart.com/Quick_Start/Modules) to start working with modules.

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

* Web: [www.anychart.com](https://www.anychart.com)
* Email: [contact@anychart.com](mailto:contact@anychart.com)
* Twitter: [anychart](https://twitter.com/anychart)
* Facebook: [AnyCharts](https://www.facebook.com/AnyCharts)
* LinkedIn: [anychart](https://www.linkedin.com/company/anychart)

## Links

* [AnyChart Website](https://www.anychart.com)
* [Download AnyChart](https://www.anychart.com/download/)
* [AnyChart Licensing](https://www.anychart.com/buy/)
* [AnyChart Support](https://www.anychart.com/support/)
* [Report Issues](https://github.com/AnyChart/anychart/issues)
* [AnyChart Playground](https://playground.anychart.com)
* [AnyChart Documentation](https://docs.anychart.com)
* [AnyChart API Reference](https://api.anychart.com)
* [AnyChart Sample Solutions](https://www.anychart.com/solutions/)
* [AnyChart Integrations](https://www.anychart.com/technical-integrations/samples/)

## License

[© AnyChart.com - JavaScript charts](https://www.anychart.com). All rights reserved.
[![](https://ga-beacon.appspot.com/UA-228820-4/AnyChart?pixel&useReferer)](https://github.com/igrigorik/ga-beacon)
