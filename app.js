d3.json('stock.json', function(json) {
    console.log(json);
});

const dataArr = [20,40,50,70];
const width = 500;
const height = 500;

const widthScale = d3.scaleLinear()
                    .domain([0, 60])
                    .range([0, width]);

const xAxis = d3.axisBottom(widthScale).ticks(5);

const canvas = d3.select("body")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(50, 50)");

canvas.append("g")
    .attr("transform","translate(0,400)")
    .call(xAxis);

const bars = canvas.selectAll("rect")
                .data(dataArr)
                .enter()
                    .append("rect")
                    .attr("width", (d) => { return widthScale(d); })
                    .attr("height", 50)
                    .attr("y", (d, i) => { return i * 100 });