$(document).ready(function() {
  Shiny.addCustomMessageHandler("bar_plot", function(params) {
    
    let { id, data } = params;
      
    if ($(`#${id} > .plot`).length === 0) {
      // settings
      const margin = {
        top: 5,
        right: 20,
        bottom: 0,
        left: 50,
      };
      const svg = d3
        .select(`#${id}`)
        .style("display", "block")
        .style("margin", "auto");
      
      const plot = svg
        .append("g")
        .attr("class", "plot")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
      
      // shadow
      plot
        .append("filter")
        .attr("id", "bar-shadow")
        .append("feDropShadow")
        .attr("stdDeviation", "1.0")
        .attr("flood-opacity", "0.25")
        .attr("dx", "1.0")
        .attr("dy", "2.0");
      
      plot
        .append("filter")
        .attr("id", "line-shadow")
        .append("feDropShadow")
        .attr("stdDeviation", "3.5")
        .attr("flood-opacity", "0.7")
        .attr("dx", "3.0")
        .attr("dy", "3.0");
      
      // collect variables
      global[id] = { margin, svg, plot };
    }
    
    // variables
    let { margin, svg, plot } = global[id];
    
    function renderBarPlot(id, width = null) {
    
      const parentDiv = $(`#${id}`).parent(".card-body");
      
      if (!width) {
        width = parentDiv.innerWidth();
      }
      const height = Math.min(width / 7, 200);
      
      parentDiv.attr("height", height);
      
      const plotWidth = width - margin.left - margin.right;
      const plotHeight = height - margin.top - margin.bottom;
      
      svg.transition().attr("width", width).attr("height", height);
      
      // x-axis
      const xDomain = [0, d3.max(data, (d) => d.x_max) * 1.1];
      const xScale = d3.scaleLinear(xDomain, [0, plotWidth]);
      
      // y-axis
      const yDomain = [...new Set(data.map((d) => d.measure))];
      const yScale = d3.scaleBand(yDomain, [0, plotHeight]);
      
      // bars
      const barHeight = Math.min((plotHeight / yDomain.length) * 0.5, 40);
      
      plot
        .selectAll(".bar")
        .data(data)
        .join(
          (enter) => {
            enter
              .append("rect")
              .attr("class", "bar")
              .attr("fill", (d) => d.color)
              .attr("x", (d) => xScale(d.x_min))
              .attr("width", (d) => xScale(d.value))
              .attr("y", (d) => yScale(d.measure))
              .attr("height", barHeight);
          },
          (update) => {
            update
              .transition()
              .attr("x", (d) => xScale(d.x_min))
              .attr("width", (d) => xScale(d.value))
              .attr("y", (d) => yScale(d.measure))
              .attr("height", barHeight);
          }
        );
      
      // labs
      plot
        .selectAll(".lab")
        .data(data.filter((d) => d.group === "delta"))
        .join(
          (enter) => {
            enter
              .append("text")
              .attr("class", "lab")
              .attr("x", (d) => xScale(d.x_max) + plotWidth * 0.01)
              .attr("y", (d) => yScale(d.measure) + barHeight / 2)
              .text((d) => d.lab);
          },
          (update) => {
            update
              .transition()
              .attr("x", (d) => xScale(d.x_max) + plotWidth * 0.01)
              .attr("y", (d) => yScale(d.measure) + barHeight / 2)
              .text((d) => d.lab);
          }
        );
    }
    global.render[id] = (width = null) => renderBarPlot(id, width);
    renderBarPlot(id);
  });
});
