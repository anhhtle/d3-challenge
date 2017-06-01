const margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// convert to right time format
let parseTime = d3.timeParse("%H:%M:%S.%L");
let timeFormat = d3.timeFormat("%H:%M:%S.%L");

// scale
const x = d3.scaleTime().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

// axis
const xAxis = d3.axisBottom(x);
const yAxis = d3.axisLeft(y);

// define areas
let botArea = d3.area()
    .curve(d3.curveStepAfter)
    .x((d) => {return x(d.timeStr);})
    .y0(height)
    .y1((d) => {return y(d.bid);});

let topArea = d3.area()
    .curve(d3.curveStepAfter)
    .x((d) => {return x(d.timeStr);})
    .y0(0)
    .y1((d) => {return y(d.ask);})

let midArea = d3.area()
    .curve(d3.curveStepAfter)
    .x((d) => {return x(d.timeStr);})
    .y0((d) => {return y(d.bid);})
    .y1((d) => {return y(d.ask);});

// define lines
let askLine = d3.line()
    .curve(d3.curveStepAfter)
    .x((d) => {return x(d.timeStr);})
    .y((d) => {return y(d.ask);});

let bidLine = d3.line()
    .curve(d3.curveStepAfter)
    .x((d) => {return x(d.timeStr);})
    .y((d) => {return y(d.bid);});

// zoom
function zoomHandler(){
    let transform = d3.zoomTransform(svg.node());
    svg.attr("transform", "translate(" + transform.x + "," + transform.y + ") scale(" + transform.k + ")");
};

let zoom = d3.zoom()
    .scaleExtent([0,10])
    .translateExtent([[0, 0], [width, height]])
    .on("zoom", zoomHandler);

// canvas
const svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .call(zoom);

//*********************** get json and process **********************/
d3.json('stock.json', (json) => {

    let data = json.bboList;
    let tradeList = json.tradeList;

    // format the data
    data.forEach((obj) => {
        obj.ask = obj.ask / 10000;
        obj.bid = obj.bid / 10000;
        obj.timeStr = parseTime(obj.timeStr);
    });

    tradeList.forEach((obj) => {
        obj.price = obj.price / 10000;
        obj.shares = +obj.shares;
        obj.time = parseTime(timeFormat(obj.time));
    });

    //console.log(tradeList);


    // scale the domain
    x.domain(d3.extent(data, (d) => {return d.timeStr}));
    y.domain([d3.min(data, (d) => {return d.bid}), d3.max(data, (d) => {return d.ask})]);

    // add area
    svg.append("path")
        .data([data])
        .attr("d", botArea)
        .attr("class", "botArea");
    
    svg.append("path")
        .data([data])
        .attr("d", midArea)
        .attr("class", "midArea");

    svg.append("path")
        .data([data])
        .attr("d", topArea)
        .attr("class", "topArea");

    // add lines
    svg.append("path")
        .data([data])
        .attr("d", askLine)
        .attr("class", "line");
    
    svg.append("path")
        .data([data])
        .attr("d", bidLine)
        .attr("class", "line");

    // add circle
    svg.selectAll("dot")
        .data(tradeList)
        .enter()
        .append("circle")
        .attr("r", 2)
        .attr("cx", (d) => {return x(d.time)})
        .attr("cy", (d) => {return y(d.price)});

    // add Axis
    svg.append("g")
        .style("font", "14px times")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    
    svg.append("g")
        .call(yAxis);

});
    //{"time":34574353918784,"price":233200,"shares":100,"tradeType":"E","orderReferenceNumber":13983473}