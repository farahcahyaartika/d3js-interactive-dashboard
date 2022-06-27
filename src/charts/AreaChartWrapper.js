// Sources: 
// https://d3-graph-gallery.com/graph/line_basic.html 16/04/2022
// https://observablehq.com/@d3/focus-context 16/04/2022
// https://www.geeksforgeeks.org/d3-js-axisbottom-function/
// https://stackoverflow.com/questions/42781226/d3-js-v3-to-v4-brush-changes
// https://codepen.io/glassboxsoftware/pen/EKBgbG
// http://www.d3noob.org/2015/07/clipped-paths-in-d3js-aka-clippath.html

import { AbstractChart } from './AbstractChart';
import * as d3 from 'd3';

export class AreaChartWrapper extends AbstractChart {

    constructor(data, attribute, parentDomElement, titleDomElement) {
        super(data, attribute, parentDomElement, titleDomElement)

        // then create the line chart and attach it to the parentDomElement

        this.backgroundColor = 'rgba(255, 99, 132, 0.5)';

        this.resetLink = document.getElementById("line-reset");

        const width = 1200;
        const height = 300;
        const margin = ({ top: 20, right: 20, bottom: 30, left: 40 });

        var areaData = this.data[this.attributeGroup];
        const y = d3.scaleLinear()
            .domain([0, d3.max(areaData, d => d.value)])
            .range([height - margin.bottom, margin.top])

        const x = d3.scaleUtc()
            .domain(d3.extent(areaData, d => d.key))
            .range([margin.left, width - margin.right])



        // AREA CHART


        // Copyright 2021 Observable, Inc.
        // Released under the ISC license.
        // https://observablehq.com/@d3/area-chart
        function AreaChart(aData, {
            // x = ([x]) => x, // given d in data, returns the (temporal) x-value
            // y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
            defined, // given d in data, returns true if defined (for gaps)
            curve = d3.curveLinear, // method of interpolation between points
            marginTop = 20, // top margin, in pixels
            marginRight = 30, // right margin, in pixels
            marginBottom = 30, // bottom margin, in pixels
            marginLeft = 40, // left margin, in pixels
            width = 640, // outer width, in pixels
            height = 400, // outer height, in pixels
            xType = d3.scaleUtc, // type of x-scale
            xDomain, // [xmin, xmax]
            xRange = [marginLeft, width - marginRight], // [left, right]
            yType = d3.scaleLinear, // type of y-scale
            yDomain, // [ymin, ymax]
            yRange = [height - marginBottom, marginTop], // [bottom, top]
            yFormat, // a format specifier string for the y-axis
            yLabel, // a label for the y-axis
            color = "currentColor", // fill color of area,
            domElement
        } = {}) {

            const svg = domElement
                .attr("viewBox", [0, 0, width, height])
                .style("display", "block");

            // const clipId = DOM.uid("clip");

            // console.log("DOM", DOM)

            svg.append("clipPath")
                .attr("id", "focus-clip") // give the clipPath an ID
                .append("rect")
                .attr("x", margin.left)
                .attr("y", 0)
                .attr("height", height)
                .attr("width", width - margin.left - margin.right);

            const gx = svg.append("g");

            const gy = svg.append("g");

            const path = svg.append("path")
                .datum(aData)
                .attr("clip-path", "url(#focus-clip)")
                .attr("fill", "steelblue");

            var formatTime = d3.timeFormat("%e %B");


            return Object.assign(svg.node(), {
                update(focusX, focusY) {
                    gx.call(xAxis, focusX, height);
                    gy.call(yAxis, focusY, aData.value);
                    path
                        .attr("d", area(focusX, focusY));
                    // .append("title")
                    // .text((d, i) => {
                    //     console.log("data area", d)
                    //     const value = d3.format(",")(d.value);
                    //     return `${d.key}\n${value}`
                    // });
                }
            });
        }

        // let chart;

        // this.render = () => {

        const chart = AreaChart(areaData, {
            domElement: this.parentDomElement,
            x: d => d.key,
            y: d => d.value,
            width,
            height,
            color: "steelblue"
        });

        // }

        // this.render.bind(this);
        // this.render();
        // FOCUS

        const focusHeight = 100;

        const yAxis = (g, y, title) => g
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y))
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".title").data([title]).join("text")
                .attr("class", "title")
                .attr("x", -margin.left)
                .attr("y", 10)
                .attr("fill", "currentColor")
                .attr("text-anchor", "start")
                .text(title));

        const xAxis = (g, x, height) => g
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));



        const area = (x, y) => d3.area()
            .defined(d => !isNaN(d.value))
            .x(d => x(d.key))
            .y0(y(0))
            .y1(d => y(d.value));

        const update = (selected) => {
            const [minX, maxX] = selected;
            const maxY = d3.max(areaData, d => minX <= d.key && d.key <= maxX ? d.value : NaN);
            chart.update(x.copy().domain(selected), y.copy().domain([0, maxY]));
            console.log("selected", selected);

            // do the filtering
            this.data[this.attributeDimension].filter([minX, maxX]);

            // update all charts
            this.observers.forEach(obs => obs.update());
        }

        update.bind(this);

        const focus = () => {
            const svg = d3.select("#area-chart-focus")
                .attr("viewBox", [0, 0, width, focusHeight])
                .style("display", "block");

            const brush = d3.brushX()
                .extent([[margin.left, 0.5], [width - margin.right, focusHeight - margin.bottom + 0.5]])
                .on("brush", brushed)
                .on("end", brushended);

            const defaultSelection = [x(d3.utcYear.offset(x.domain()[1], -1)), x.range()[1]];

            svg.append("g")
                .call(xAxis, x, focusHeight);


            svg.append("path")
                .datum(areaData)
                .attr("fill", "steelblue")
                .attr("d", area(x, y.copy().range([focusHeight - margin.bottom, 4])));

            // console.log("lineData", lineData)

            const gb = svg.append("g")
                .call(brush)
                .call(brush.move, defaultSelection);

            function brushed({ selection }) {
                if (selection) {
                    svg.property("value", selection.map(x.invert, x).map(d3.utcDay.round));
                    svg.dispatch("input");
                    update(selection.map(x.invert, x).map(d3.utcDay.round));
                }
            }

            function brushended({ selection }) {
                if (!selection) {
                    gb.call(brush.move, defaultSelection);
                }
            }

            return svg.node();
        }

        const focusObj = focus();

        // update 
        // const [minX, maxX] = focusObj;
        // console.log("maxY", maxY);
        // const maxY = d3.max(lineData, d => minX <= d.key && d.key <= maxX ? d.value : NaN);
        // chart.update(x.copy().domain(focusObj), y.copy().domain([0, maxY]));


        this.clickResetListener = () => {
            this.resetAll();
            this.observers.forEach(obs => obs.update());
        }

        // this.resetLink.addEventListener("click", this.clickResetListener);
    }

    // you only need to implement this method if you need to do something specific here
    update() {
        // update labels and values on the chart using this.data
        console.log("area chart updated!", this.attribute);
        super.update();
        // this.render();
    }

    resetAll() {
        this.data[this.attributeDimension].filterAll();
        this.initState = true;
        this.update();
    }

    // this is probably not needed
    addObserver(obs) {
        super.addObserver(obs);
    }

}