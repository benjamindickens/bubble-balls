import {scaleLinear} from "d3-scale";
import {select} from "d3-selection";
import {extent} from "d3-array";
import {drag} from "d3-drag";
import {forceSimulation, forceManyBody, forceX, forceY, forceCollide} from "d3-force";
import "./scss/index.scss";

let currentIndex = 1;

export default class {
    constructor(container, data, options) {
        this.container = typeof container === "string" ? document.querySelector(container) : container;
        this.appIndex = currentIndex;
        currentIndex++;
        this.data = data;
        this.formattedData = null;
        this.measurementUnit = {
            name: options?.measurementUnit?.name || "px",
            initialRadiusData: [],
        };
        this.randomizeData = options?.randomizeData || false;
        this.debounceDelay = options?.debounceDelay || 150;
        this.scaleRadius = null;
        this.simulation = null;
        this.balls = null;
        this.svg = null;
        this.elements = null;
        this.title = null;
        this.htmlContainer = null;
        this.titlePropertyName = options?.titlePropertyName || "title";
        this.breakpoint = options?.breakpoint || 667;
        this.defs = null;
        this.imgPropertyName = options?.imgPropertyName || "img";
        this.draggable = options?.draggable === false ? false : true;
        this.groupsStyles = options?.groupsStyles || null;
        this.defaultStyles = {
            color: options?.defaultStyles?.color === undefined ? "#000000" : options?.defaultStyles?.color,
            background: options?.defaultStyles?.background === undefined ? "#FFFFFF" : options?.defaultStyles?.background,
            borderColor: options?.defaultStyles?.borderColor === undefined ? "#000000" : options?.defaultStyles?.borderColor,
            borderWidth: options?.defaultStyles?.borderWidth === undefined ? 2 : options?.defaultStyles?.borderWidth
        }
        this.dynamicFontSize = {
            init: options?.dynamicFontSize?.init || true,
            min: options?.dynamicFontSize?.min || this.measurementUnit.name === "px" ? 10 : 1,
        };
        this.groupParam = {
            name: options?.groupParam?.name || null, list: [],
        };
        this.radiusParam = {
            name: options?.radiusParam?.name || null,
            min: options?.radiusParam?.min || this.measurementUnit.name === "px" ? 40 : 4,
            max: options?.radiusParam?.max || this.measurementUnit.name === "px" ? 100 : 7,
            extent: null,
        };
        this.forces = {
            y: options?.forces?.y || 0.05,
            x: options?.forces?.x || 0.05,
            collisionMultiplier: options?.forces?.collisionMultiplier || 1.2,
            charge: options?.forces?.charge || 200,
        };
        this.dimensions = {
            width: null,
            height: null,
            containerArea: null,
            ballsArea: null,
            relocationStepX: null,
            initialBallsArea: null,
            padding: options?.dimensions?.padding || this.measurementUnit.name === "px" ? 10 : 1,
            defaultRadius: options?.dimensions?.defaultRadius || this.measurementUnit.name === "px" ? 60 : 6,
            cols: options?.dimensions?.cols || 1,
            xCenter: options?.dimensions?.xCenter || [],
            yCenter: options?.dimensions?.yCenter || [],
        };
        this.on = {
            mouseover: options?.on?.mouseover || null,
            mouseout: options?.on?.mouseout || null,
            afterInit: options?.on?.afterInit?.bind(this) || null
        };
        this.detectMobile = () => {
            return window.innerWidth < this.breakpoint;
        }
        this.isMobile = this.detectMobile();

        this.debounce = (func, delay, params) => {
            let timeline = false;

            return function () {
                if (timeline) return;
                timeline = true;

                setTimeout(() => {
                    func.apply(params);
                    timeline = false;
                }, delay);
            };
        };

        this.getOneUnit = () => this.container.querySelector(".balls-unit-example").offsetWidth;

        this.calcDimensions = () => {
            const current = this.container.getBoundingClientRect();
            this.dimensions.width = current.width;
            this.dimensions.height = current.height;
            this.dimensions.containerArea = Math.round(current.width * current.height);
            this.dimensions.relocationStepX = current.width / this.dimensions.cols;
        };

        this.calcDimensionsY = () => {
            this.dimensions.rows = Math.round(this.dimensions.amoutOfGroups / this.dimensions.cols);
            this.dimensions.relocationStepY = this.dimensions.height / this.dimensions.rows;
        }


        this.scaleUpOnResize = async (scaleUp) => {
            if (scaleUp) {
                if (this.dimensions.ballsArea < this.dimensions.containerArea && (this.dimensions.initialBallsArea > this.dimensions.ballsArea)) {
                    data.forEach((item) => (item.radius += item.radius * 0.05));
                    await this.optimizeSize(data);
                }
            }
        }

        this.recalculateRadius = (item, value, oneUnit) => {
            item.radius = value * oneUnit;
        }

        this.optimizeStatic = async (data, isScaleUp) => {
            if (this.dimensions.ballsArea > this.dimensions.containerArea) {
                data.forEach((item) => {
                    item.radius -= item.radius * 0.05
                });
                await this.optimizeSize(data);
            } else if (!this.dimensions.initialBallsArea) {
                this.dimensions.initialBallsArea = this.dimensions.ballsArea;
            }
            if (this.dimensions.initialBallsArea) {
                await this.scaleUpOnResize(isScaleUp)
            }
        }

        this.onDeviceChange = (data, unitValue) => {
            const currentScreen = this.detectMobile();
            if (this.isMobile !== currentScreen) {
                this.isMobile = currentScreen;
                this.measurementUnit.optimizedRadiusData = [...this.measurementUnit.initialRadiusData];
                data.forEach((item, index) => item.radius = this.measurementUnit.optimizedRadiusData[index] * unitValue)
            }
        }

        this.optimizeRelative = async (data, unitValue) => {
            if (this.dimensions.ballsArea > this.dimensions.containerArea) {
                data.forEach((item, index) => {
                    item.radius -= item.radius * 0.05
                    this.measurementUnit.optimizedRadiusData[index] = item.radius / 10;
                });
                await this.optimizeSize(data);
            } else {
                data.forEach((item, index) => {
                    this.recalculateRadius(item, this.measurementUnit.optimizedRadiusData[index], unitValue)
                });
            }
        }

        this.optimizeSize = async (data) => {
            let unitValue = null;

            if (this.measurementUnit.name !== "px") {
                unitValue = this.getOneUnit();
                await this.onDeviceChange(data);
            }

            this.dimensions.ballsArea = Math.round(data.reduce((prev, cur) => prev + 3.14 * cur.radius ** 2 * 2, 0));
            const isScaleUp = this.dimensions.lastWidth < this.dimensions.width;
            this.dimensions.lastWidth = this.dimensions.width;

            if (this.measurementUnit.name === "px") {
                await this.optimizeStatic(data, isScaleUp)
            } else {
                await this.optimizeRelative(data, unitValue)
            }

        };

        this.getAmountOfGroups = (data) => {
            const groups = data.map((item) => item.group);
            const uniqGroups = new Set(groups);
            this.dimensions.amoutOfGroups = uniqGroups.size;


        };

        this.shuffleData = (data) => {
            const array = [...data];
            let currentIndex = array.length, randomIndex;
            while (currentIndex !== 0) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;
                [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
            }
            return array;
        };

        this.getFormattedData = async (data) => {
            let unitValue = null;

            if (this.measurementUnit.name !== "px") {
                unitValue = this.getOneUnit();
            }


            if (options?.radiusParam?.name) {
                this.radiusParam.extent = await extent(data, (item) => item[options?.radiusParam?.name]);

                this.scaleRadius = this.measurementUnit.name !== "px"
                    ? await scaleLinear().domain(this.radiusParam.extent).range([this.radiusParam.min * unitValue, this.radiusParam.max * unitValue])
                    : await scaleLinear().domain(this.radiusParam.extent).range([this.radiusParam.min, this.radiusParam.max])
            }

            this.formattedData = (this.randomizeData ? this.shuffleData(data) : data).map((item) => {

                if (!item.radius) {
                    if (this.radiusParam.name) {
                        item.radius = this.scaleRadius(item[this.radiusParam.name]);
                    } else {
                        item.radius = this.dimensions.defaultRadius;
                    }
                }


                if (this.measurementUnit.name !== "px") {
                    if (this.radiusParam.name) {
                        this.measurementUnit.initialRadiusData.push(item.radius / 10);
                    } else {
                        this.measurementUnit.initialRadiusData.push(item.radius);
                        item.radius *= unitValue;
                    }
                }

                if (!item.group) {
                    if (this.groupParam.name) {
                        const inList = this.groupParam.list.find((group) => group.name === item[this.groupParam.name]);
                        if (inList) {
                            item.group = inList.index;
                        } else {
                            const newGroup = {
                                name: item[this.groupParam.name], index: this.groupParam.list.length + 1,
                            };
                            item.group = newGroup.index;

                            this.groupParam.list.push(newGroup);
                        }
                    } else {
                        item.group = 1;
                    }
                }

                if (this.groupsStyles) {
                    const currentStyleItem = this.groupsStyles.find(styles => styles.groupName === item[this.groupParam.name]) || this.groupsStyles[item.group - 1];
                    item.background = currentStyleItem?.background;
                    item.color = currentStyleItem?.color;
                    item.borderWidth = currentStyleItem?.borderWidth;
                    item.borderColor = currentStyleItem?.borderColor;
                }

                return item;
            });

            this.measurementUnit.optimizedRadiusData = [...this.measurementUnit.initialRadiusData]
        };

        this.prepareData = async () => {
            await this.getFormattedData(this.data);
            await this.getAmountOfGroups(this.formattedData);
            await this.calcDimensionsY();
            await this.setPositionXY();
            await this.optimizeSize(this.formattedData);
        };

        this.getPositionX = () => {
            this.dimensions.xCenter = [];
            let currentGroupIndex = 0;
            let currentColumnIndex = 1;

            do {
                if (currentColumnIndex > this.dimensions.cols) {
                    currentColumnIndex = 1;
                }

                if (currentColumnIndex <= this.dimensions.cols) {
                    if (this.dimensions.cols === 1) {
                        this.dimensions.xCenter.push(this.dimensions.relocationStepX / 2);
                    } else {
                        this.dimensions.xCenter.push(this.dimensions.relocationStepX * currentColumnIndex * 0.75);
                    }
                }

                currentColumnIndex++;
                currentGroupIndex++;
            } while (currentGroupIndex < this.dimensions.amoutOfGroups);
        };

        this.getPositionY = () => {
            this.dimensions.yCenter = [];
            let currentGroupIndex = 0;
            let currentColIndex = 1;
            let currentRowIndex = 1;

            do {
                if (currentColIndex > this.dimensions.cols) {
                    currentColIndex = 1;
                    currentRowIndex++;
                }

                if (currentRowIndex <= this.dimensions.rows) {
                    if (this.dimensions.rows === 1) {
                        this.dimensions.yCenter.push(this.dimensions.relocationStepY / 2);
                    } else {
                        this.dimensions.yCenter.push(this.dimensions.relocationStepY * currentRowIndex);
                    }
                }

                currentColIndex++;
                currentGroupIndex++;
            } while (currentGroupIndex < this.dimensions.amoutOfGroups);
        };

        this.tickBalls = () => {
            this.balls
                .attr("r", (d) => d.radius)
                .attr("cx", (d) => {
                    const extraSize = d.radius + this.dimensions.padding;
                    if (d.x + extraSize > this.dimensions.width) {
                        d.x = this.dimensions.width - extraSize;
                        return d.x;
                    } else if (d.x < extraSize) {
                        d.x = 0 + extraSize;
                        return d.x;
                    } else {
                        return d.x;
                    }
                })
                .attr("cy", (d) => {
                    const extraSize = d.radius + this.dimensions.padding;
                    if (d.y + extraSize > this.dimensions.height) {
                        d.y = this.dimensions.height - extraSize;
                        return d.y;
                    } else if (d.y < extraSize) {
                        d.y = 0 + extraSize;
                        return d.y;
                    } else {
                        return d.y;
                    }
                });

            this.images
                .attr("height", (d) => d.radius * 2)
                .attr("width", (d) => d.radius * 2);

            this.htmlContainer
                .attr("x", (d) => d.x)
                .attr("y", (d) => d.y);

            this.title
                .style("font-size", (d) => {
                    const text = d[this.titlePropertyName];

                    if (d[this.titlePropertyName] && this.dynamicFontSize.init) {
                        return this.setDynamicFontSize(text, d.radius, this.dynamicFontSize.min);
                    }
                });
        };

        this.setDynamicFontSize = (text, radius, min) => {
            const length = text.length;
            let size = radius / 4;

            if (length > size) {
                size *= 8 / length;
                const result = this.measurementUnit.name ? Math.round(size) / 10 : Math.round(size);

                return (result < min ? min : result) + this.measurementUnit.name;
            }
        }

        this.setSimulation = () => {
            this.simulation = forceSimulation(this.formattedData)
                .force("charge", forceManyBody().strength(this.forces.charge))
                .force("x", forceX()
                    .x((d) => this.dimensions.xCenter[d.group - 1])
                    .strength(this.forces.x))
                .force("y", forceY()
                    .y((d) => this.dimensions.yCenter[d.group - 1])
                    .strength(this.forces.y))
                .force("collision", forceCollide().radius((d) => d.radius * this.forces.collisionMultiplier))
                .on("tick", this.tickBalls);
        };

        this.setPositionXY = async () => {
            await this.getPositionX();
            await this.getPositionY();
        };

        this.mouseover = (hovered) => {
            this.on.mouseover.call(select(hovered));
        };

        this.mouseout = (hovered) => {
            this.on.mouseout.call(select(hovered));
        };

        this.dragStart = (event, d) => {
            const circle = select(`ball-container-${this.appIndex}-${d.id}`).classed("dragging", true);
            this.simulation.alphaTarget(0.03).restart();

            const dragged = (event, d) => {
                circle
                    .raise()
                    .attr("cx", (d.x = event.x))
                    .attr("cy", (d.y = event.y));
            };

            const ended = () => {
                circle.classed("dragging", false);
                this.simulation.alphaTarget(0.03);
            };

            event.on("drag", dragged).on("end", ended);
        };

        this.initBalls = async () => {
            await this.setSimulation();

            this.svg = select(this.container)
                .append("svg")
                .attr("height", this.dimensions.height)
                .attr("width", this.dimensions.width);

            this.elements = this.svg
                .selectAll(".ball")
                .data(this.formattedData)
                .enter()
                .append("g")
                .attr("class", (d) => `ball-container-${this.appIndex}-${d.id}`);

            if (this.draggable) {
                this.elements.call(drag().on("start", this.dragStart, true));
            }

            this.balls = this.elements
                .append("circle")
                .classed("ball", true)
                .attr("r", (d) => d.radius)
                .attr("stroke", (d) => d.borderColor || this.defaultStyles.borderColor)
                .attr("stroke-width", (d) => d.borderWidth || this.defaultStyles.borderWidth)
                .attr("fill", (d) => (d[this.imgPropertyName] ? `url(#img-${this.appIndex}-${d.id})` : d.background || this.defaultStyles.background))
                .on("mouseover", (event) => {
                    if (this.on.mouseover) {
                        this.mouseover(event.target);
                    }
                })
                .on("mouseout", (event) => {
                    if (this.on.mouseout) {
                        this.mouseout(event.target);
                    }
                });

            this.htmlContainer = this.elements
                .append('foreignObject')
                .classed("ball-html", true)
                .attr("width", (d) => d.radius * 1.6)
                .attr("overflow", "visible")
                .attr("height", (d) => d.radius * 2)
                .attr("transform", d => `translate(-${d.radius * .8}, -${d.radius})`);

            this.title = this.htmlContainer
                .append('xhtml:div')
                .classed("ball-title", true)
                .html(d => d[this.titlePropertyName])
                .style("color", (d) => d.color || this.defaultStyles.color)
                .style("font-size", (d) => {
                    const text = d[this.titlePropertyName];

                    if (d[this.titlePropertyName] && this.dynamicFontSize.init) {
                        return this.setDynamicFontSize(text, d.radius, this.dynamicFontSize.min);
                    }
                });

            this.defs = this.svg.append("defs");

            this.patterns = this.defs
                .selectAll("pattern")
                .data(this.formattedData.filter((item) => item[this.imgPropertyName]))
                .enter()
                .append("pattern")
                .attr("id", (d) => `img-${this.appIndex}-${d.id}`)
                .attr("width", 1)
                .attr("height", 1)
                .attr("patternUnits", "objectBoundingBox")
                .attr("preserveAspectRatio", "xMidYMid slice");

            this.images = this.patterns
                .append("image")
                .attr("height", (d) => d.radius * 2)
                .attr("width", (d) => d.radius * 2)
                .style("transition", "height 0.3s, width 0.3s")
                .style("clip-path", "circle(50%)")
                .attr("preserveAspectRatio", "xMidYMid slice")
                .attr("xlink:href", (d) => {
                    if (d[this.imgPropertyName]) {
                        return d[this.imgPropertyName];
                    }
                });
        };

        this.resizeBalls = async () => {
            await this.calcDimensions();
            await this.setPositionXY();
            await this.optimizeSize(this.formattedData)

            this.svg.attr("height", this.dimensions.height);
            this.svg.attr("width", this.dimensions.width);

            this.simulation.restart();

            this.setSimulation();
        };

        this.beforeInit = async () => {
            await this.calcDimensions();
            await this.prepareData(this.data);
        };

        this.init = async () => {
            await this.initBalls();
        };

        this.afterInit = () => {
            window.addEventListener("resize", this.debounce(this.resizeBalls, this.debounceDelay));

            this.on.afterInit && this.on.afterInit();
        };

        this.start = async () => {
            await this.beforeInit();
            await this.init();
            await this.afterInit();
        };

        this.start();

    }

}