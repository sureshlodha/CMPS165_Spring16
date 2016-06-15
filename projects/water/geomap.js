
// https://d3-geomap.github.io/map/choropleth/world/

var transition_duration = 900;

var format = function(d) {
    d = d / 1000;
    return d3.format(',.0f')(d) + ' K';
}

//updates the year to display, changing colors and tooltip values
var updateYear = function(newYear) {
    d3.select('.yearlabel').text("Current year: " + newYear);
    map.properties.column = newYear;

    // Add new fill styles based on data values.
    map.data.forEach(function (d) {
       var uid = d[map.properties.unitId],
           val = d[map.properties.column],
           fill = map.colorScale(val);

       // selectAll must be called and not just select, otherwise the data
       // attribute of the selected path object is overwritten with map.data.
       var unit = map.svg.selectAll('.' + map.properties.unitPrefix + '' + uid);

       // Data can contain values for non existing units.
       if (!unit.empty()) {
           if (map.properties.duration) {
               unit.transition()
                   .duration(map.properties.duration)
                   .style('fill', fill);
           } else {
               unit.style('fill', fill);
           }

           // New title with column and value.
           var text = map.properties.unitTitle(unit.datum());
           val = map.properties.format(val);
           unit.select('title').text('' + text + '\n\n' + map.properties.column + ': ' + val);
       }
    });
}   

var years = ['1962', '1967', '1972', '1977', '1982', '1987',
             '1992', '1997', '2002', '2007', '2012', '2014'];

var stepYear = function() {
    if (typeof stepYear.i == 'undefined') stepYear.i = 0;
    
    // update map
    updateYear(years[stepYear.i]);
   // move handle of slider
    slider.setValue(years[stepYear.i]);
    stepYear.i = (stepYear.i + 1) % years.length;
}

var animateIt = function() {
    var interval = setInterval(stepYear, transition_duration),
        duration = transition_duration * years.length + 1;
    
    // disable play button
    document.getElementById("play").setAttribute('disabled', 'disabled');
    
    setTimeout(function(i) {
        clearInterval(i);
        // re-enable play button after animation finishes
        document.getElementById("play").removeAttribute('disabled');
    }, duration, interval);
}

var map = d3.geomap.choropleth()
    .geofile('dependencies/countries.json')
    .column('2014')
    .colors(colorbrewer.RdYlBu[9])
    .domain([1000, 10000])
    .format(format)
    .legend(true)
    .unitId('Country Code')
    .scale(0, 100000)
    .duration(transition_duration);

var slideYear = function(_slider) {
    updateYear(_slider.value());
}

var slider = d3.slider()
    .min(years[0])
    .max(years[years.length-1])
    .tickValues(years)
    .stepValues(years)
    .callback(slideYear)
    .tickFormat(d3.format("d"))
    .tickSize(12);



d3.csv('water_res.csv', function(error, data) {
    if (error) console.log(error);
    
    console.log(data);
    d3.select('#map')
        .datum(data)
       .call(map.draw, map);
    
    d3.select('#slider').call(slider);
    slider.setValue(years[years.length-1]);
});


