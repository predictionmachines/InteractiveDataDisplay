Interactive Data Display
------------------------

[![Build Status](https://drone.k8s.grechka.family/api/badges/predictionmachines/InteractiveDataDisplay/status.svg)](https://drone.k8s.grechka.family/predictionmachines/InteractiveDataDisplay)
[![npm](https://img.shields.io/npm/v/interactive-data-display.svg)](https://www.npmjs.com/package/interactive-data-display)
[![CDNJS](https://img.shields.io/cdnjs/v/interactive-data-display.svg)](https://cdnjs.com/libraries/interactive-data-display)
[![jsdelivr](https://data.jsdelivr.com/v1/package/npm/interactive-data-display/badge)](https://www.jsdelivr.com/package/npm/interactive-data-display)

Interactive Data Display for JavaScript (IDD for short) is a set of controls for adding interactive visualization of dynamic data to your application. 
It allows to create line graphs, bubble charts, heat maps and other complex 2D plots which are very common in scientific software. 
Dynamic Data Display integrates well with Bing Maps control to show data on a geographic map in latitude/longitude coordinates. 
The controls can also be operated programmatically. 

IDD is being developed in close collaboration between [Information Technologies in Sciences laboratory](http://itis.cs.msu.ru) of Moscow State University and Microsoft Research Cambridge. 

Documentation is available [here](https://github.com/predictionmachines/InteractiveDataDisplay/wiki). 

## Samples

You can find several [live samples here](http://predictionmachines.github.io/InteractiveDataDisplay/samples/IDDSamples.html). Note that they can use not the latest release of the IDD.

For the full set of samples which work with the latest release consider Building IDD (section below) and open samples from "Samples" directory after the build succeeds.

Building IDD
------------

In order to build IDD, you need Node.js/npm and git.

Clone a copy of the IDD git repo, enter IDD directory and install development tools packages:

`cd idd`

`npm install -g yarn`

`yarn install`

Now you can build and test IDD by running the grunt command without arguments:

`grunt`

File IDDSamples.html in the root of idd repository contains many samples. Note that some browsers don't run web workers from local file system
for security reasons so some samples may not work if opening IDDSamples.html as local file.

Referencing IDD
---------------

Interactive Data Display is available as [NPM package](https://www.npmjs.com/package/interactive-data-display).

Use yarn:
`yarn add interactive-data-display`

or npm:
`npm i interactive-data-display`

Licensing
---------

Please see the file called LICENSE.
