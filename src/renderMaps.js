// Sources:

import { GeoChartWrapper } from './charts/GeoChartWrapper';
import { addObservers } from './addObservers';

export const renderMaps = (mycrossfilter, otherCharts) => {

    // const url = "https://unpkg.com/world-atlas@2.0.2/countries-50m.json";
    const url = "../dist/de-bundeslaender.json";

    
    fetch(url).then((result) => result.json()).then((datapoint) => {
        console.log(datapoint);

        // const countries = ChartGeo.topojson.feature(datapoint, datapoint.objects.countries).features;
        const countries = datapoint.features;

        const chartGroupData = mycrossfilter["stateGroup"];

        function findCountryValue(country) {
            let countryObj = chartGroupData.find(object => object.key === country.properties.name);
            if (countryObj) return countryObj.value
            else return 0
        }

        // setup 
        const data = {
            labels: countries.map(country => country.properties.name),
            datasets: [{
                data: countries.map(country => ({ feature: country, value: findCountryValue(country) }))
            }]
        };

        var width = 300,
            height = 200;

        // d3.geoMercator()
        // .scale(2250)
        // .center([10.4541194, 51.1642292])
        // .translate([width / 2, height / 2])


        // const myGeoChart = new GeoChartWrapper(mycrossfilter, "state", parentDomElement, myChart);
        // const allCharts = otherCharts;

        // allCharts.push(myGeoChart);

        // addObservers(allCharts);

    });

}