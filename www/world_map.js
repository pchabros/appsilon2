$(document).ready(function() {
  Shiny.addCustomMessageHandler("world_map", function(params) {
    
    let { id, data } = params;
    
    if ($(`#${id} > .map`).length === 0) {
      // settings
      const svg = d3
        .select(`#${id}`)
        .attr("class", "map-svg");
        
      const plot = svg
        .append("g")
        .attr("class", "map");
        
      // shadow
      plot
        .append("filter")
        .attr("id", "map-shadow")
        .append("feDropShadow")
        .attr("stdDeviation", "2.5")
        .attr("flood-opacity", "0.2")
        .attr("dx", "2.2")
        .attr("dy", "2.2");
      
      // tooltip
      const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .attr("id", `#${id}-tooltip`)
        .style("opacity", 0);
      
      // collect variables
      global[id] = { svg, plot, tooltip };
    }
    
    // variables
    let { svg, plot, tooltip } = global[id];
    
    function renderWorldMap(id) {
      
      const parentDiv = $(`#${id}`).parent(".card-body");
      width = parentDiv.innerWidth() * 0.96;
      const height = width * 0.8;
      
      parentDiv.attr("height", height);
      
      svg.transition().attr("width", width).attr("height", height);
      
      const proj = d3
        .geoMercator()
        .scale(width / 5.2)
        .rotate([352, 0, 0])
        .translate([width / 2, height / 2]);
      
      const path = d3.geoPath().projection(proj);
      
      /*
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
      */
      
      // scale
      const cScale = (d) => {
        const scale = d3.scaleSequential(
          [0, d3.max(data, (d) => d.value) * 2],
          d3.interpolateOranges
        );
        const country = data.find((v) => v.country === d.id);
        if (country) return scale(country.value);
        else return "rgb(240, 240, 240)";
      };
      
      // polygons
      plot
        .selectAll("path")
        .data(global[id].geography.features)
        .join(
          (enter) => {
            enter
              .append("path")
              .attr("class", "polygon")
              .attr("d", path)
              .attr("fill", cScale);
          },
          (update) => {
            update.transition()
              .attr("d", path)
              .attr("fill", cScale);
          }
        );
    }
    if (global[id].geography) {
      renderWorldMap(id);
    } else {
      d3.json("world_countries.json").then(geo => {
        global[id].geography = geo;
        renderWorldMap(id);
      });
    }
    global.render[id] = () => renderWorldMap(id);
  });
});
