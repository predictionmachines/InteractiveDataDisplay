Interactive Data Display
------------------------

[![Build Status](https://travis-ci.org/predictionmachines/InteractiveDataDisplay.svg?branch=master)](https://travis-ci.org/predictionmachines/InteractiveDataDisplay)
![npm](https://img.shields.io/npm/v/interactive-data-display.svg)
![CDNJS](https://img.shields.io/cdnjs/v/interactive-data-display.svg)
[![Gitter](https://badges.gitter.im/interactivedatadisplay/Lobby.svg)](https://gitter.im/interactivedatadisplay/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

Interactive Data Display for JavaScript (IDD for short) is a set of controls for adding interactive visualization of dynamic data to your application. 
It allows to create line graphs, bubble charts, heat maps and other complex 2D plots which are very common in scientific software. 
Dynamic Data Display integrates well with Bing Maps control to show data on a geographic map in latitude/longitude coordinates. 
The controls can also be operated programmatically. 

IDD is being developed in close collaboration between [Information Technologies in Sciences laboratory](http://itis.cs.msu.ru) of Moscow State University and Microsoft Research Cambridge. 

Documentation is available [here](https://github.com/predictionmachines/InteractiveDataDisplay/wiki). 


Building IDD
------------

In order to build IDD, you need Node.js/npm and git.

Clone a copy of the IDD git repo, enter IDD directory and install development tools packages:

`cd idd`

`npm install`

IDD uses Grunt to run build tasks. You will need to install grunt command line interface as a global package (if not already installed):

`npm install -g grunt-cli`

Now you can build and test IDD by running the grunt command without arguments:

`grunt`

File IDDSamples.html in the root of idd repository contains many samples. Note that some browsers don't run web workers from local file system
for security reasons so some samples may not work if opening IDDSamples.html as local file.

Referencing IDD
---------------

Interactive Data Display is available as Bower package. You can download IDD as bower package by running:

`bower install idd`

Using in offline projects
-------------------------

Interactive Data Display is available as self contained script.
You may use idd.selfcontained.js in small or offline projects. This script contains all IDD dependencies inside and easy to import.

Licensing
---------

Please see the file called LICENSE.
