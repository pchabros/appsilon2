$(document).ready(function() {
  Shiny.addCustomMessageHandler("expand_toogle", function(id) {
    const plotDiv = $(`#${id}`);
    const plotsCol = $("#plots-col");
    const expanded = plotsCol.hasClass("col-lg-12");
    const areaWidth = $("#plots-area").innerWidth();
    let plotWidth;
    if (expanded) {
      plotsCol.addClass("col-lg-6").removeClass("col-lg-12");
      plotWidth = areaWidth / 2;
    } else {
      plotsCol.addClass("col-lg-12").removeClass("col-lg-6");
      plotWidth = areaWidth;
    }
    const plotHeight = plotWidth * 0.5;
    plotDiv.attr("height", plotHeight);
    const plotId = `${id}-plot`;
    global.render[plotId](plotWidth);
  });
});
