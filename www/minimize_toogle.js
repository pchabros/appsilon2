$(document).ready(function() {
  Shiny.addCustomMessageHandler("minimize_toogle", function(id) {
    $(`#${id} > .card-body`).slideToggle();
  });
});
