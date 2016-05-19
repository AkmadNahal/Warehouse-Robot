const clientSocket = io.connect('');
clientSocket.emit('get_all_shelves');
clientSocket.on('response_get_all_shelves', function(shelfArray, data) {
    //console.log(shelfArray);
    let shelfId = shelfArray.shelfLocation;
    let domBoxArray = $('.shelf' + shelfId + '> div');

    for(let i = 0; i < shelfArray.boxes.length; i++) {
        $(domBoxArray[i]).append('<p>' + JSON.stringify(shelfArray.boxes[i]) + '</p>');
    }

    paintGraph(shelfId, data);

// Set height, width and padding

});


var boxid = '573d83dee38cfabe301b9403';
clientSocket.emit('remove_box', (boxid));
clientSocket.on('response_remove_box', function(status) {
    if (status == true) {
        alert("box has been deleted!");
    } else {
        alert("something is fucked");
    }
});

var x = 2;
var y = 1;
clientSocket.emit("move", (x,y));
clientSocket.on("response_move", function(movestatus) {
    if (movestatus == true){
        alert("The robot has been succesfully moved");
    }
    else {
        alert("The move is not acceptable");
    }

});





function paintGraph(target,data){

    var data = data[0];

    var height = 300,
        width = 250,
        padding = 25;

//  Select the div where the new SVG will be appended.
//  Set the height and width
//  Add an SVG group element to the new SVG
//  Give the group element an id of viz (visualization)
//  transform is the attribute to position the g-element within the
//  SVG. So we want the G-element placed 60px down and 60px to the right.

    var viz = d3.select('#viz-wrapper'+target)
        .append('svg')
        .attr('height', height + padding * 2)
        .attr('width', width + padding * 2)
        .append('g')
        .attr('id', 'viz')
        .attr('transform', 'translate(' + padding + ',' + padding +')');


//  We then set up the scales. The xScale is based on time, so we use the
//  so we use the d3.time functions. Then we want to use the scale functionality and
//  then set the range, that is the pixel range that the time will be mapped over,
//  so from 0 to the width of the SVG

//  On the yScale we want a linear range, the values will be just normal values like temp.
//  The 0 value will be mapped to the bottom of the SVG, that is the height, and the max value
//  should be mapped to the top of the screen, 0 px.

    var xScale = d3.time.scale().range([0, width]);
    var yScale = d3.scale.linear().range([height, 0]);

//  We than want to set up an xAxis that show the values.

//  The xAxis should use the xScale to scale it correctly, and be oriented beneath the graph.
//  The ticks is the number of values that will be displayed on the axis.

    var xAxis = d3.svg.axis().scale(xScale)
        .orient('bottom')
        .ticks(20);

    var yAxis = d3.svg.axis().scale(yScale)
        .orient('left')
        .ticks(20);

//  To make sure that all the time values is in the correct format, we can use the built in
//  d3.time.format to have a easy converter tool for our date/time variables.

    var parseTime = d3.time.format.iso;

//  Now all the SVG work is done, and we are ready to bring in the dataset!
//  In this example, we have all our data stored in an csv file.
//  We first want to set up the x and y domain, by checking through the dataset for the max/min values.
//  d3.extent is function that returns a array [min, max], by looping through all data.

    var yDomain = d3.extent(data, function(d) {
        return parseInt(d.temperature_celsius);
    });


//  Because we want to add a month on each side, we don't use extent for the xDomain.

    var xMin = d3.min(data, function(d) {
        var time = parseTime.parse(d.time);
        time.setMinutes(time.getMinutes() - 5);
        return time;
    });

    var xMax = d3.max(data, function(d) {
        var time = parseTime.parse(d.time);
        time.setMinutes(time.getMinutes() + 5);
        return time;
    });

//  Now the x and y domain will be used to calibrate the xScale and yScale
//  so that when we give the scale a value, it will return a correct position
//  in the SVG pixel space.

    xScale.domain([xMin, xMax]);
    yScale.domain([5,30]);

//  Now we want to add the x and y axis to the svg. We do that by first appending a new
//  g-element, and adding an x axis and y axis class to it. We want to move the x-axis down
//  to the bottom of the svg, so the height downwards
//  The call(xAxis) just puts the already defined x-axis into the newly created g-element
//  We then want to rotate the text-elements 65 degrees on the x-axis.

    viz.append('g')
        .attr('class','x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis)
        .selectAll('text')
        .attr('transform', function() {
            return 'rotate(-65)'
        })
        .style('text-anchor', 'end')
        .style('font-size', '10px')
        .attr('dx', '-10px')
        .attr('dy', '10px');

    viz.append('g')
        .attr('class', 'y axis')
        .call(yAxis);
//  Now we will finally add the separate data dots. We find all g.dots elements in the
//  group element 'viz' and bind data to each element. We then call enter, which looks in the
//  DOM if the element is there or not. If it is not already there, it will put it in.
//  For every data point, we add a new g-element and set it's class to 'dots'.

    var dots = viz.selectAll('g.dots')
        .data(data)
        .enter()
        .append('g')
        .attr('class', 'dots')

//  The group element dots are now going to be positioned in the visualization.
//  The date is set by parsing the time, and then using the xScale to get the
//  pixel cordinate for the element. And the yScale(d.TMAX) gives the y-cordinate
//  The group elements position is then set by the translate attribute and the x and y
//  We then set border stroke (border) and the fill color (background)

    dots.attr('transform', function(d) {
            var date = parseTime.parse(d.time);
            var x = xScale(date);
            var y = yScale(d.temperature_celsius);
            return 'translate(' + x + ', ' + y + ')';
        })
        .style('stroke', '#00ffd2')
        .style('fill', '#006bff');

//  Then we append a circle element to each group element, with a radius 5

    dots.append('circle')
        .attr('r', 5);

//  We also append a text-element, and the text is fetched from the data. We want the text
//  to be hidden, and be shown when hovering the element

    dots.append('text')
        .text(function(d) {
            return d.temperature_celsius;
        })
        .attr('display', 'none');

//  When doing mouseover

    dots.on('mouseover', function(d, i){
        var dot = d3.select(this);
        dot.select('text')
            .style('display', 'block');
    });
}

