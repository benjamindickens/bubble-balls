# Demo

https://benjamindickens.github.io/grid-mosaic-demo/

# Installation

```bash
npm install grid-mosaic
```

# Initialization

###### HTML
1) Add a container to your page with "mosaic" class.
2) Add items with "mosaic-item" class to the container.

```bash

<div class="mosaic">

    <a href="/test" class="mosaic-item">
        <img src="https://picsum.photos/200" alt="photo">
    </a>
    
    or 
    
     <img class="mosaic-item" src="https://picsum.photos/200" alt="photo">
     
    or you can add any additional html if needed
    
     <a href="/" target="_blank" class="mosaic-item">
        <img src="https://picsum.photos/200" alt="photo">
        <div class="mosaic__tooltip">
            <div class="mosaic__tooltip-title">Title</div>
            <div class="mosaic__tooltip-content">Content</div>
        </div>
    </a>

</div>
```

###### JS
3) Initialize the app in your js file with default set up or modify it manually.

```bash
import Mosaic from "grid-mosaic";

new Mosaic(".mosaic")

or with an option object

new Mosaic(".mosaic", options)
```

# Options

###### measurement units
Choose a measurement unit you are going to use in your app.
```bash
measure: "px" / "em" / "rem" || default: "px";
```

###### dimension
Set dimensions for grid container. The value "size" specifies "min-width" and "height" of cells.
It applies necessary styles to the container. By default, for desktop "grid-template: repeat(5, 90px/rem/em) / repeat(5, minmax(90px/rem/em, 1fr))". To set the correct measurement unit use option "measure".
The default value of max-width for each cell is 1fr. If you don't want the mosaic to stretch for the whole page, specify the "width" value of the container in css.
```bash
dimension: {
            desktop: {
                cols: number || default : 5,
                rows: number || default : 5,
                size: number || default : 90
            },
            mobile: {
                cols: number || default : 3,
                rows: number || default : 6,
                size: number || default : 90
            },
        };
```

###### maxSize
It means max amount of cells one item can occupy.

```bash
maxSize: {
            desktop: {
                y: number || default: 3,
                x: onumber || default: 3,
            },
            mobile: {
                y: number || default: 3,
                x: number || default: 3,
            }
        };
```

###### maxItems
Max amount of items that are shown in the container. Others will appear through the animation.
```bash
maxItems: {
            desktop: number || default: null,
            mobile: number || default: null,
        };
```

###### otherElements
Takes array of objects to specify places occupied in current mosaic and places them.
The example below place the el into container by assigning the rule in format "grid-area: 5 / 1 / span 2 / span 7"
```bash
otherElements: [{
        el: document.querySelector(".js-caption"),
        coordinates: {
            desktop: [5,1,2,7],
            mobile: [1,2,4,3]
          }
        }, {....}] || default: [];
```

###### bg
Draw additional background items to take over all container.
```bash
bg: true / false || default: true;
```

###### bgStyles
You may specify main color for background elements or pass the array of classes that will be implemented to elements in random sequence.
```bash
bgStyles: {
        background: #bada55 || default : #FFFFFF,
        classes: ["class-1", "class-2" ...] || default: null
        };
```

###### bgAnimation
Specify the rules for bg animation. It is activated by default. If you want to disable it set "0" or "false".
Effects - allow you to pass classes that will perform the animation.
```bash
bgAnimation: {
            delay: number / false || default : 8000,
            effects: ["_slide-0", "slide-1" ...] || default : ["_illuminate-0", "_illuminate-1", "_illuminate-2", "_illuminate-3"]
        }
```

###### noSausagePatterns
Prevent items from a bad aspect ratio. 
```bash
noSausagePatterns: true / false || default : true;
```

###### randomItems
Shuffle the elements in the container to get a random sequence after the page reload.
```bash
randomItems: false / true || default : true;
```

###### gaps
Specify a grid-gap. (You can do it in css.)
```bash
gaps: {
        desktop: number || default: 0,
        mobile: number || default: 0,
       };
```

###### items
Specify the items of the mosaic.
```bash
items: [...] || default: document.querySelectorAll(".mosaic-item");
```

###### autoplay
The settings of the animation (that changes the position of the elements within the container) delay.  It is activated by default. If you want to disable it set "0" or "false".
```bash
autoplay: {
            delay:  number / false || default : 3500,
            preventDefaultHover: true / false || default :  false,
            opacityDefaultOutDuration: number || default: 500,
        };
```

###### on
Here you can add your custom functions.
```bash
on: {
            mouseover: () => { your code ...} || default: null,
            mouseout: func || default: null,
            beforeInit: func || default: null,
            afterInit: func || default: null
        }
```

###### maxTries
The max amount of tries of calculation an item position.
```bash
maxTries: number || default: 60 ;
```

###### breakpoint
The value of @media (in pixels).
```bash
breakpoint: number || default: 667;
```
