$(document).ready(function() {
  Shiny.addCustomMessageHandler("remove", function(id) {
    $(`#${id}`).parent().slideUp(400, function() {
      $(this).remove();
    });
  });
});
