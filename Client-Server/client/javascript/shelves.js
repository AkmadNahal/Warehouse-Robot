$(document).ready(function() {

    const clientSocket = io.connect('');

    $('.inc').on('click', () => {
        debugger;
        let classElement = $(event.target).parent().prop('class');
        let shelfNr = classElement.substring(14);
        clientSocket.emit('inc_temp', shelfNr);
    });

    $('.dec').on('click', () => {
        debugger;
        let classElement = $(event.target).parent().prop('class');
        let shelfNr = classElement.substring(14);
        clientSocket.emit('dec_temp', shelfNr);
    });

    function changePendingStorage(boxId) {
        $('#' + boxId).find('.pendingStorage').fadeOut(500).html('<strong>Box in shelf!</strong>').css('color', 'green').parent()
            .append("<button type='button' class='btn btn-danger pull-right'>Retrive box</button>").find('.pendingStorage').fadeIn(500);
        $('#' + boxId).find('button').on('click', (event)=> {
            pendingRemove(event);
        });
    }

    function removeBox(boxId, relocateBoxId) {

        if(relocateBoxId) {
            $('.' + relocateBoxId+ '> br').fadeOut(500).remove();
            $('.' + relocateBoxId+ '> p').fadeOut(500).remove();
            $('.' + relocateBoxId+ '> button').fadeOut(500).remove();
            $('.' + relocateBoxId+ '> button').fadeOut(500).remove();
            $('.' + relocateBoxId).append('<p><strong>EMPTY</strong></p>').css('color', 'black').css('opacity','1').hide().fadeIn(500);
            $('.' + relocateBoxId).prop('id','');
            $('.' + relocateBoxId).removeClass(relocateBoxId);


        } else {
            $('#' + boxId+ '> br').fadeOut(500).remove();
            $('#' + boxId+ '> p').fadeOut(500).remove();
            $('#' + boxId+ '> button').fadeOut(500).remove();
            $('#' + boxId).append('<p><strong>EMPTY</strong></p>').css('color', 'black').hide().fadeIn(500);
            $('#' + boxId).prop('id','');

        }

    }

    function pendingRemove(event) {
        let boxId = $(event.target).parent().prop('id');
        $('#' + boxId+ '> br').fadeOut(500).remove();
        $('#' + boxId+ '> p').fadeOut(500).remove();
        $('#' + boxId+ '> button').remove();
        $('#' + boxId).append('<p><strong>BOX IS BEING REMOVED FROM STORAGE, LOADING...</strong></p>').css('color', 'green').hide().fadeIn(500);
        clientSocket.emit('remove_box', (boxId));
    }

    function showMove(id) {
        $('.moveAlert').show().hide().slideDown(500);
        setTimeout(() => { $('.moveAlert').slideUp(500); }, 6000);
    }

    function relocateInProgress(relocateObject) {
        $('#'+relocateObject.box._id).css('opacity','0.4').addClass('tempId_'+relocateObject.box._id);

        var newSlot = $('.shelf'+relocateObject.newLocation.x).find('.shelf-slot')[relocateObject.newLocation.y-1];

        $(newSlot).find('p').remove();


        $(newSlot).append('<p><strong>Name: </strong>' + relocateObject.box.boxName + '</p>'
            + '<p style="display:inline-block;"><strong>ID:</strong> ' + relocateObject.box._id + '</p>'
            + '<br>'
            + '<p style="display:inline-block; margin-right: 1%;"><strong>Maximum temperature:</strong> ' + relocateObject.box.prefTemp.max + '</p>'
            + '<p style="display:inline-block;"><strong>Minimum temperature:</strong> ' + relocateObject.box.prefTemp.min + '</p>'
            + '<br>'
            + '<p style="display:inline-block;  margin-right: 1%;"><strong>Maximum light:</strong> ' + relocateObject.box.prefLight.max + '</p>'
            + '<p style="display:inline-block;"><strong>Minimum light:</strong> ' + relocateObject.box.prefLight.min + '</p>'
            + '<br>'
            + '<p class="pendingStorage" style="display:inline-block; color: red;"><strong>Box being placed by robot...</strong></p>'
        ).css('opacity', '0.4').prop('id', relocateObject.box._id);
    }

    function relocateComplete(boxId) {
        removeBox(false, 'tempId_'+boxId);
        $('#'+boxId).css('opacity','1');
        changePendingStorage(boxId);

    }

    clientSocket.on('robot_status_update', (command, id) => {

        switch (command) {

            case 'insert':
                changePendingStorage(id);
                break;

            case 'remove':
                removeBox(id);
                break;

            case 'move':
                showMove(id);
                break;

            case 'relocate_in_progress':
                debugger;
                relocateInProgress(id);
                break;

            case 'relocate':
                console.log('relocated ' + id);
                relocateComplete(id);
        }

    });

    clientSocket.on('temp_outside_range', (minOrMax, box)=> {

        if(minOrMax == 'max') {
            let temperatureP1 = $('#' + box._id +' > p')[2];
            $(temperatureP1).css('color', 'red');

        } else {
            let temperatureP2 = $('#' + box._id +' > p')[3];
            $(temperatureP2).css('color', 'red');
        }
    });

    clientSocket.on('new_sensor_value', function(deviceData, deviceId) {
        let temperature = deviceData.temperature_celsius;
        let light = deviceData.light_lux;
        let shelf = deviceId;
        $('#temp_shelf_'+ deviceId).fadeOut(50).fadeIn(300).html(deviceData.temperature_celsius + ' °C');
        $('#temp_shelf_'+ deviceId).siblings('h6').html(new Date);

    });

    $('.move_command').submit(() => {
        event.preventDefault();
        var $inputs = $('.move_command').find('.form-group').first().find('input')
        var coordinates = {};
        var id = Date.now();
        $inputs.each(function() {
            coordinates[this.id] = this.value;
        });

        if(coordinates.x > -1 && coordinates.x < 4 &&
            coordinates.y > -1 && coordinates.y < 4 &&
            coordinates.x !== '' && coordinates.y !== ''
        ) {
            clientSocket.emit('move_command', coordinates, id);
        } else {
            alert("Coordinates outside navigation area! Max values: x = 3 and y = 3");

        }

    });


    $(".close").click(function(){
        $("#myAlert").alert("close");
    });

    $('.myForm').submit(function() {
        event.preventDefault();
        var $inputs = $('.myForm :input');
        console.log($inputs);

        var values = {};
        $inputs.each(function() {
            values[this.name] = $(this).val();
        });

        var noTemp = $('#noTemp').prop('checked');
        var noLight = $('#noLight').prop('checked');

        if(noTemp) {
            values.minTemp = -200;
            values.maxTemp = 1000;
        }

        if(noLight) {
            values.minLight = 0;
            values.maxLight = 10000;
        }


        var box = {
            createdBy: 'john',
            boxName: values.boxname,
            prefTemp: {
                min: parseInt(values.minTemp),
                max: parseInt(values.maxTemp)
            },
            prefLight: {
                min: parseInt(values.minLight),
                max: parseInt(values.maxLight)
            },
            pendingStorage: true		// True when processed by the robot. When the robot is done, it is set to false
        }


        clientSocket.emit('add_box', (box));
        $('.modal-footer').find('button').trigger('click')

        setTimeout(() => {
            $('.boxUpdateAlert').slideUp(500);
        }, 6000);

    });


    clientSocket.on('add_box_status', function(shelf, box) {

        if(box) {
            $('.boxUpdateAlert').show().hide().delay(500).slideDown(500);

            let domBoxArray = $('.shelf' + shelf.shelfLocation + '> .shelf-slot');
            let shelfBoxesLength = 0;
            for(let i = 0; i < shelf.boxes.length; i++) {
                if(shelf.boxes[i] === '') {
                    shelfBoxesLength = i;
                    i = shelf.boxes.length;
                }
            }

            $(domBoxArray[shelfBoxesLength]).prop('id', box._id);

            $('#' + box._id + '> p').remove();
            $(domBoxArray[shelfBoxesLength]).append('<p><strong>Name: </strong>' + box.boxName + '</p>'
                + '<p style="display:inline-block;"><strong>ID:</strong> ' + box._id + '</p>'
                + '<br>'
                + '<p style="display:inline-block; margin-right: 1%;"><strong>Maximum temperature:</strong> ' + box.prefTemp.max + '</p>'
                + '<p style="display:inline-block;"><strong>Minimum temperature:</strong> ' + box.prefTemp.min + '</p>'
                + '<br>'
                + '<p style="display:inline-block;  margin-right: 1%;"><strong>Maximum light:</strong> ' + box.prefLight.max + '</p>'
                + '<p style="display:inline-block;"><strong>Minimum light:</strong> ' + box.prefLight.min + '</p>'
                + '<br>'
                + '<p class="pendingStorage" style="display:inline-block; color: red;"><strong>Box being placed by robot...</strong></p>'
            );
        } else {
            $('.boxUpdateAlertFail').show().hide().delay(500).slideDown(500);
            setTimeout(() => {
                $('.boxUpdateAlertFail').slideUp(500);
            }, 6000);
        }
    });


    function paintGraph(target,dataIn) {

        var data = dataIn[0];

        var height = 300,
            width = 250,
            padding = 40;

//  Select the div where the new SVG will be appended.
//  Set the height and width
//  Add an SVG group element to the new SVG
//  Give the group element an id of viz (visualization)
//  transform is the attribute to position the g-element within the
//  SVG. So we want the G-element placed 60px down and 60px to the right.

        var viz = d3.select('#viz-wrapper' + target)
            .append('svg')
            .attr('height', height + padding * 2)
            .attr('width', width + padding * 2)
            .append('g')
            .attr('id', 'viz')
            .attr('transform', 'translate(' + padding + ',' + padding + ')');


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

        var yDomain = d3.extent(data, function (d) {
            return parseInt(d.temperature_celsius);
        });


//  Because we want to add a month on each side, we don't use extent for the xDomain.

        var xMin = d3.min(data, function (d) {
            var time = parseTime.parse(d.time);
            time.setMinutes(time.getMinutes());
            return time;
        });

        var xMax = d3.max(data, function (d) {
            var time = parseTime.parse(d.time);
            time.setMinutes(time.getMinutes());
            return time;
        });

//  Now the x and y domain will be used to calibrate the xScale and yScale
//  so that when we give the scale a value, it will return a correct position
//  in the SVG pixel space.

        xScale.domain([xMin, xMax]);
        yScale.domain([-20,40]);

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

        /*
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
         var y = yScale(d.Light_lux);
         return 'translate(' + x + ', ' + y + ')';
         })
         .style('stroke', '#00ffd2')
         .style('fill', '#006bff');

         //  Then we append a circle element to each group element, with a radius 5

         dots.append('circle')
         .attr('r', 5);
         */

        var x = d3.scale.linear()
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);

        var line = d3.svg.line()
            .x(function(d) {
                //console.log("Herro");
                return xScale(parseTime.parse(d.time));
            })
            .y(function(d) {
                return yScale(parseInt(d.temperature_celsius));
            });



        viz.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", line);
//  We also append a text-element, and the text is fetched from the data. We want the text
//  to be hidden, and be shown when hovering the element
        /*
         dots.append('text')
         .text(function(d) {
         return d.Light_lux;
         })
         .attr('display', 'none');

         //  When doing mouseover

         dots.on('mouseover', function(d, i){
         var dot = d3.select(this);
         dot.select('text')
         .style('display', 'block');
         });

         */
    };


    //Check to see if the window is top if not then display button
    $(window).scroll(function(){
        if ($(this).scrollTop() > 100) {
            $('.scrollToTop').fadeIn();
        } else {
            $('.scrollToTop').fadeOut();
        }
    });

    //Click event to scroll to top
    $('.scrollToTop').click(function(){
        $('html, body').animate({scrollTop : 0},800);
        return false;
    });

    clientSocket.emit('get_all_shelves');

    clientSocket.on('response_get_all_shelves', (shelfArray, data) => {
        console.log(shelfArray);
        let shelfId = shelfArray.shelfLocation;
        let domBoxArray = $('.shelf' + shelfId + '> .shelf-slot');

        for (let i = 0; i < shelfArray.shelfCapacity; i++) {
            if(shelfArray.boxes[i] !== '') {
                $(domBoxArray[i]).append('<p><strong>Name: </strong>' + shelfArray.boxes[i].boxName + '</p>'
                    + '<p style="display:inline-block;"><strong>ID:</strong> ' + shelfArray.boxes[i]._id + '</p>'
                    + '<br>'

                    + '<p style="display:inline-block; margin-right: 1%;"><strong>Maximum temperature:</strong> ' + shelfArray.boxes[i].prefTemp.max + '</p>'
                    + '<p style="display:inline-block;"><strong>Minimum temperature:</strong> ' + shelfArray.boxes[i].prefTemp.min + '</p>'
                    + '<br>'
                    + '<p style="display:inline-block;  margin-right: 1%;"><strong>Maximum light:</strong> ' + shelfArray.boxes[i].prefLight.max + '</p>'
                    + '<p style="display:inline-block;"><strong>Minimum light:</strong> ' + shelfArray.boxes[i].prefLight.min + '</p>'
                    + '<br>'
                );

                if(shelfArray.boxes[i].pendingStorage) {
                    $(domBoxArray[i]).append (
                        '<p class="pendingStorage" style="display:inline-block; color: red;"><strong>Box being placed by robot...</strong></p>'
                    )
                } else {
                    $(domBoxArray[i]).append (
                        '<p class="pendingStorage" style="display:inline-block; color: green;"><strong>Box in shelf!</strong></p>'
                    );
                    debugger;
                    $(domBoxArray[i]).append("<button type='button' class='btn btn-danger pull-right'>Retrive box</button>")
                    $(domBoxArray[i]).find('button').on('click', (event)=> {
                        pendingRemove(event);
                    });
                }
            } else {
                $(domBoxArray[i]).append('<p><strong>EMPTY</strong></p>');
            }
            $(domBoxArray[i]).prop('id', shelfArray.boxes[i]._id);
        }
        paintGraph(shelfId, data);
    });



});

