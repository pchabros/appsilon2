$(document).ready(function() {
  Shiny.addCustomMessageHandler("line_bar_plot", function(params) {
    
    let { id, data } = params;
    
    if ($(`#${id} > .plot`).length === 0) {
      // settings
      const margin = {
        top: 15,
        right: 60,
        bottom: 20,
        left: 30,
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
      
      // scales, axes
      const xScale = d3.scaleLinear();
      const yScale = d3.scaleLinear();
      
      const xAxis = d3.axisBottom(xScale).ticks(6).tickSize(0);
      const yAxis = d3.axisLeft(yScale).ticks(7);
      
      const xAxisG = plot.append("g").attr("class", "axis xAxis");
      
      const yAxisG = plot
        .append("g")
        .attr("class", "axis yAxis")
        .attr("transform", `translate(${margin.left}, 0)`);
      
      // tooltip
      const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .attr("id", `#${id}-tooltip`)
        .style("opacity", 0);
    
      // collect variables
      global[id] = {
        margin,
        svg,
        plot,
        xScale,
        yScale,
        xAxis,
        yAxis,
        xAxisG,
        yAxisG,
        tooltip,
      };
    }
    
    // variables
    let {
      margin,
      svg,
      plot,
      xScale,
      yScale,
      xAxis,
      yAxis,
      xAxisG,
      yAxisG,
      tooltip,
    } = global[id];
    
    function renderBarLinePlot(id, width = null) {
      
      const parentDiv = $(`#${id}`).parent(".card-body");
      
      if (!width) {
        width = parentDiv.innerWidth();
      }
      const height = width / 2.57;
      
      parentDiv.attr("height", height);
      
      const plotWidth = width - margin.left - margin.right;
      const plotHeight = height - margin.top - margin.bottom;
      
      svg.transition().attr("width", width).attr("height", height);
      
      // x-axis
      const xDomain = d3.extent(data, (d) => d.x);
      const xExtent = xDomain[1] - xDomain[0];
      xDomain[0] -= xExtent * 0.1;
      xDomain[1] += xExtent * 0.05;
      xScale.domain(xDomain).range([0, plotWidth]);
      
      xAxisG
        .transition()
        .attr("transform", `translate(0, ${plotHeight})`)
        .call(xAxis);
      
      // y-axis
      const yDomain = d3.extent([
        ...data.map((d) => d.min),
        ...data.map((d) => d.max),
      ]);
      const yExtent = yDomain[1] - yDomain[0];
      yDomain[0] -= yExtent * 0.1;
      yDomain[1] += yExtent * 0.1;
      yScale.domain(yDomain).range([plotHeight, 0]);
      
      yAxis.tickSize(-plotWidth);
      yAxisG.transition().call(yAxis);
      
      // tooltip
      const tooltipText = (d) => `
        <p>group: ${d.bar === "yellow" ? "low" : "high"}</p>
        <p>max: ${d.max.toFixed(1)}</p>
        <p>min: ${d.min.toFixed(1)}</p>
        <p>delta: ${(d.max - d.min).toFixed(1)}</p>
        `;
      
      window.addEventListener("mousemove", function (e) {
        tooltip
          .style("top", `${+e.clientY + window.scrollY + 5}px`)
          .style("left", `${+e.clientX + 3}px`);
      });
      
      function pointMouseOver() {
        tooltip
          .html(d3.select(this).attr("tooltip"))
          .transition()
          .style("opacity", 0.8);
      }
      
      function pointMouseLeave() {
        tooltip.transition().style("opacity", 0);
      }
      
      const cScale = d3.scaleOrdinal(
        ["shadow", "yellow", "blue"],
        ["white", "#f7f48b", "#70a1d7"]
      );
      
      const barWidth = (plotWidth / 26) * 0.33;
      
      plot
        .selectAll(".bar")
        .data(data)
        .join(
          (enter) => {
            enter
              .append("rect")
              .attr("class", "bar")
              .attr("tooltip", tooltipText)
              .attr("fill", (d) => cScale(d.bar))
              .attr("filter", (d) =>
                d.bar === "shadow" ? "url(#bar-shadow)" : "none"
              )
              .attr("x", (d) => xScale(d.x) - barWidth / 2)
              .attr("width", barWidth)
              .attr("y", (d) => yScale(d.max))
              .attr("height", (d) => yScale(d.min) - yScale(d.max))
              .on("mouseover", pointMouseOver)
              .on("mouseleave", pointMouseLeave);
          },
          (update) => {
            update
              .transition()
              .attr("x", (d) => xScale(d.x) - barWidth / 2)
              .attr("width", (plotWidth / 26) * 0.3)
              .attr("y", (d) => yScale(d.max))
              .attr("height", (d) => yScale(d.min) - yScale(d.max));
          }
        );
      
      const lineGen = d3
        .line()
        .curve(d3.curveNatural)
        .x((d) => xScale(d.x))
        .y((d) => yScale(d.line));
      
      const lineData = d3.group(
        data.filter((d) => d.bar === "blue"),
        (d) => d.bar
      );
      
      plot
        .selectAll(".line")
        .data(lineData)
        .join(
          (enter) => {
            enter
              .append("path")
              .attr("class", "line")
              .attr("d", (d) => lineGen(d[1]));
          },
          (update) => {
            update.transition().attr("d", (d) => lineGen(d[1]));
          }
        );
    }
    global.render[id] = (width = null) => renderBarLinePlot(id, width);
    renderBarLinePlot(id);
  });
});
