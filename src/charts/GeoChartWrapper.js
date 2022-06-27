// Sources: 
// https://observablehq.com/@d3/choropleth
// https://observablehq.com/@d3/state-choropleth

import { AbstractChart } from './AbstractChart';
import * as d3 from 'd3';

export class GeoChartWrapper extends AbstractChart {

    constructor(data, attribute, parentDomElement, titleDomElement) {
        super(data, attribute, parentDomElement, titleDomElement)
        // this.parentDomElement.addEventListener("click", this.clickListener);
        const domElement = this.parentDomElement;
        const geoData = this.data[this.attributeGroup];

        const domainMin = d3.min(geoData, function(d) { return +d.value; })
        const domainMax = d3.max(geoData, function(d) { return +d.value; })

        // the click listener will do the following:
        const filter = (evt, filterElement) => {
            // determine the selected value

            let label = filterElement.properties.name;

            const value = this.data[this.attributeGroup].filter((d) => {
                return d.key == label;
            })[0].value

            // save current filter attributes
            if (this.currentFilters.includes(label))
                this.currentFilters = this.currentFilters.filter(e => e !== label)
            else
                this.currentFilters.push(label);

            // do the filtering
            if (this.currentFilters.length > 0)
                this.data[this.attributeDimension].filter(a =>
                    this.currentFilters.includes(a)
                );
            else
                this.data[this.attributeDimension].filter(null);

            console.log("current filters " + this.attributeDimension, this.currentFilters, this.data[this.attributeGroup]);

            // once you have filtered the data, you call;
            // (this works, if all observers have a reference to the SAME
            // data object, which seems to be the case in the current impl
            this.observers.forEach(obs => obs.update());
        }

        filter.bind(this);

        // Three function that change the tooltip when user hover / click / leave a cell
        var mouseover = function (event, d) {
            d3.select(this)
                .style("opacity", 0.5)
        }

        var mouseleave = function (event, d) {
            d3.select(this)
                .style("stroke", "none")
                .style("opacity", 1)
        }

        var click = function (event, d) {
            filter(event, d);
            const color = updateColor(d);
            d3.select(this)
                .style("stroke", "none")
                .style("opacity", 1)
                .style("fill", color)
            console.log("pie clicked!", d)
        }

        var color = d3.scaleSequential(d3.schemeBlues[9]).domain([domainMin, domainMax]);

        const updateColor = (filterElement) => {
            const label = filterElement.properties.name;
            if (this.currentFilters.includes(label)) {
                return color(label);
            } else {
                return "#ccc"
            }
        }

        // CLOROPLETH

        // Copyright 2021 Observable, Inc.
        // Released under the ISC license.
        // https://observablehq.com/@d3/choropleth
        function Choropleth(data, {
            id = d => d.id, // given d in data, returns the feature id
            value = () => undefined, // given d in data, returns the quantitative value
            title, // given a feature f and possibly a datum d, returns the hover text
            format, // optional format specifier for the title
            scale = d3.scaleSequential, // type of color scale
            domain, // [min, max] values; input of color scale
            range = d3.interpolateBlues, // output of color scale
            width = 640, // outer width, in pixels
            height, // outer height, in pixels
            projection, // a D3 projection; null for pre-projected geometry
            features, // a GeoJSON feature collection
            featureId = d => d.id, // given a feature, returns its id
            borders, // a GeoJSON object for stroking borders
            outline = projection && projection.rotate ? { type: "Sphere" } : null, // a GeoJSON object for the background
            unknown = "#ccc", // fill color for missing data
            fill = "white", // fill color for outline
            stroke = "white", // stroke color for borders
            strokeLinecap = "round", // stroke line cap for borders
            strokeLinejoin = "round", // stroke line join for borders
            strokeWidth, // stroke width for borders
            strokeOpacity, // stroke opacity for borders
            domElement
        } = {}) {
            // Compute values.
            const N = d3.map(data, id);
            const V = d3.map(data, value).map(d => d == null ? NaN : +d);
            const Im = new d3.InternMap(N.map((id, i) => [id, i]));
            const If = d3.map(features.features, featureId);

            // Compute default domains.
            if (domain === undefined) domain = d3.extent(V);

            // Construct scales.
            const color = scale(domain, range);
            if (color.unknown && unknown !== undefined) color.unknown(unknown);

            // Compute titles.
            if (title === undefined) {
                format = color.tickFormat(100, format);
                title = (f, i) => `${f.properties.name}\n${format(V[i])}`;
            } else if (title !== null) {
                const T = title;
                const O = d3.map(data, d => d);
                title = (f, i) => T(f, O[i]);
            }

            // Compute the default height. If an outline object is specified, scale the projection to fit
            // the width, and then compute the corresponding height.
            if (height === undefined) {
                if (outline === undefined) {
                    height = 400;
                } else {
                    const [[x0, y0], [x1, y1]] = d3.geoPath(projection.fitWidth(width, outline)).bounds(outline);
                    const dy = Math.ceil(y1 - y0), l = Math.min(Math.ceil(x1 - x0), dy);
                    projection.scale(projection.scale() * (l - 1) / l).precision(0.2);
                    height = dy;
                }
            }

            // Construct a path generator.
            const path = d3.geoPath(projection);

            const svg = domElement
                .attr("viewBox", [0, 0, width, height])
                .attr("style", "width: 100%; height: auto; height: intrinsic;");

            if (outline != null) svg.append("path")
                .attr("fill", fill)
                .attr("stroke", "currentColor")
                .attr("d", path(outline));

            svg.append("g")
                .selectAll(".state")
                .data(features.features)
                .join("path")
                .attr("class", "state")
                .attr("fill", (d, i) => color(V[Im.get(If[i])]))
                .attr("d", path)
                .on("click", click)
                .on("mouseover", mouseover)
                .on("mouseleave", mouseleave)
                .append("title")
                .text((d, i) => {
                    const t = title(d, Im.get(If[i]));
                    return t;
                });

            if (borders != null) svg.append("path")
                .attr("pointer-events", "none")
                .attr("fill", "none")
                .attr("stroke", stroke)
                .attr("stroke-linecap", strokeLinecap)
                .attr("stroke-linejoin", strokeLinejoin)
                .attr("stroke-width", strokeWidth)
                .attr("stroke-opacity", strokeOpacity)
                .attr("d", path(borders));

            return Object.assign(svg.node(), { scales: { color } });
        }

        const url = "../dist/de-bundeslaender.json";

        this.render = () => {



            fetch(url).then((result) => result.json()).then((countries) => {

                const width = 600;
                const height = 800;
                const projection = d3.geoMercator()
                    .scale(3500)
                    .center([10.4541194, 51.1642292])
                    .translate([width / 2, height / 2]);

                const countrymap = new Map(countries.features.map(d => [d.properties.name, d.id]))

     

                console.log("geoData", geoData, domainMin, domainMax)

                const chart = Choropleth(geoData, {
                    id: d => countrymap.get(d.key),
                    value: d => d.value,
                    scale: d3.scaleQuantize,
                    domain: [domainMin, domainMax],
                    range: d3.schemeBlues[9],
                    projection: projection,
                    // title: (f, d) => `${f.properties.name}, ${countrymap.get(f.id.slice(0, 2)).properties.name}\n${d?.value}%`,
                    features: countries,
                    // borders: statemesh,
                    width: width,
                    height: height,
                    domElement: domElement
                });
            });
        }

        this.render.bind(this);
        this.render();

    }

    // you only need to implement this method if you need to do something specific here
    update() {
        // update labels and values on the chart using this.data
        super.update();
        this.render();
    }

    resetAll() {
        this.data[this.attributeDimension].filterAll();
        this.initState = true;
        this.currentFilters = [];
        this.update();
    }

    // this is probably not needed
    addObserver(obs) {
        super.addObserver(obs);
    }

}