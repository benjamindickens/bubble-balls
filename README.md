# Base 

https://github.com/d3/d3

# Demo

https://benjamindickens.github.io/bubble-balls-demo/

# Installation

```bash
npm install bubble-balls
```

# Initialization

###### HTML

1) Add a container to your page with "balls" class.
2) If you intend to **use relative** units you have to add another element inside with class "balls-unit-example".

```bash

<div class="balls">
    <div class="balls-unit-example"></div> 
</div>

```

###### JS

3) Initialize the app in your js file with default set up or modify it manually with the option object.

```bash
import Balls from "bubble-balls";

new Balls(".mosaic", options)

```

###### Notes

Unfortunately right now you can't use absolutely the same data object for different instances on one page.

# Options

###### measurement units

Choose a measurement unit you are going to use in your app.

```bash
measure: "px" / "em" / "rem" || default: "px";
```

###### on

Here you can add your custom functions.

```bash
on: {
      mouseover: () => { your code ...} || default: null,
      mouseout: func || default: null,
      afterInit: func || default: null,
    }
```

###### breakpoint

The value of @media (in pixels).

```bash
breakpoint: number || default: 667;
```
