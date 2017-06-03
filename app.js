const margin = {top: 20, right: 95, bottom: 100, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - 50;

// for mouse-move event
let bisectDate = d3.bisector(function(d) { return d.timeStr; }).left;

// convert to right time format
let parseTime = d3.timeParse("%H:%M:%S.%L");

function convertNanoseconds(nano) {
    let h = Math.floor(nano/3600000000000);
    let m = Math.floor((nano/3600000000000)%1*60);
    let s = ((nano/3600000000000)%1*60%1*60).toFixed(3);
    let hms = (h+ ":"+m+":"+s);
    return parseTime(hms);
};

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

//** don't need lines >> used area instead

// let askLine = d3.line()
//     .curve(d3.curveStepAfter)
//     .x((d) => {return x(d.timeStr);})
//     .y((d) => {return y(d.ask);});

// let bidLine = d3.line()
//     .curve(d3.curveStepAfter)
//     .x((d) => {return x(d.timeStr);})
//     .y((d) => {return y(d.bid);});

// zoom
function zoomHandler(){
    let transform = d3.zoomTransform(svg.node());
    svg.attr("transform", "translate(" + transform.x + "," + transform.y + ")scale(" + transform.k + ")");
};

let zoom = d3.zoom()
    .scaleExtent([0,10])
    .translateExtent([[0, 0], [width, height]])
    .on("zoom", zoomHandler);

// tradeList Mouse-over
function handleTradeMouseOver(d){
    d3.select('.infobox').text(
        "Order: " + d.orderReferenceNumber + ", Type: " + d.tradeType +
        ", Price: " + d.price + ", Shares: " + d.shares);
}

// legend on click
function handleClickE(){
    let e = d3.selectAll('.E'); // select all tradeType E
    e.classed('hidden', !e.classed('hidden')); // toggle class hidden
    // change legend color
    let legendE = d3.select('.circle-E');
    legendE.classed('inactive', !legendE.classed('inactive'));
};

function handleClickP(){
    let p = d3.selectAll('.P'); // select all tradeType E
    p.classed('hidden', !p.classed('hidden')); // toggle class hidden
    // change legend color
    let legendP = d3.select('.circle-P');
    legendP.classed('inactive', !legendP.classed('inactive'));
};

// canvas
const svg = d3.select("#root").append("svg")
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
        obj.time = convertNanoseconds(obj.time);
    });

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

    //*** don't need lines >>> used area instead

    // svg.append("path")
    //     .data([data])
    //     .attr("d", askLine)
    //     .attr("class", "line");
    
    // svg.append("path")
    //     .data([data])
    //     .attr("d", bidLine)
    //     .attr("class", "line");


    // add Axis
    svg.append("g")
        .style("font", "14px times")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    
    svg.append("g")
        .call(yAxis);

    // y axis title
    svg.append("text")
        .attr("transform", "translate(15, 60)rotate(-90)")
        .text("Price($)");

    // add legend
    let legend = svg.append("g")
        .attr("transform", "translate(" + (width*0.4) + "," + (height + 30) + ")");
    
    // E
    legend.append("circle")
        .attr("class", "legend circle-E")
        .attr("r", 5).attr("cx", 10).attr("cy", 13)
        .on("click", handleClickE);;
    
    legend.append("text")
        .attr("x", 20).attr("y", 18)
        .attr("class", "legend")
        .text("Type E")
        .on("click", handleClickE);
    
    // P
    legend.append("circle")
        .attr("class", "legend circle-P")
        .attr("r", 5).attr("cx", 100).attr("cy", 13)
        .on("click", handleClickP);;;

    legend.append("text")
        .attr("x", 115).attr("y", 18)
        .attr("class", "legend")
        .text("Type P")
        .on("click", handleClickP);

    // add tradeType info box on hover
    let infoBox = svg.append("g")
        .attr("transform", "translate("+ (width*0.35) + "," + (height - 50) + ")");
    
    infoBox.append("text")
        .attr("class", "infobox");

    // mouse-over event
    let mouseLine = svg.append("g");

    mouseLine.append("line")
        .attr("class", "x-hover-line hover-line")
        .attr("y1", height)
        .attr("y2", 0);
    
    mouseLine.append("text")
        .attr("class", "text-ask")
        .attr("x", 15)
        .attr("y", 50);
    
    mouseLine.append("text")
        .attr("class", "text-bid")
        .attr("x", 15)
        .attr("y", 70);

    svg.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", () => { mouseLine.style("display", null); })
        .on("mouseout", () => { mouseLine.style("display", "none"); })
        .on("mousemove", mousemove);

    function mousemove() {
        var x0 = x.invert(d3.mouse(this)[0]),
            i = bisectDate(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i],
            d = x0 - d0.timeStr > d1.timeStr - x0 ? d1 : d0;
        mouseLine.attr("transform", "translate(" + x(d.timeStr) + ")");
        mouseLine.select(".text-ask").text(() => { return ("ask :" + d.ask);});
        mouseLine.select(".text-bid").text(() => { return ("bid :" + d.bid);});
    }

    // add tradeList circles
    svg.selectAll("dot")
        .data(tradeList)
        .enter()
        .append("circle")
        .attr("class", (d) => {return d.tradeType})
        .attr("r", 3)
        .attr("cx", (d) => {return x(d.time)})
        .attr("cy", (d) => {return y(d.price)})
        .on("mouseover", handleTradeMouseOver)
        .on("mouseout", () => { d3.select('.infobox').text('')});

});