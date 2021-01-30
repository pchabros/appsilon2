mod_info_cards_ui <- function(id) {
  ns <- NS(id)
  fluidRow(uiOutput(ns("info_cards")))
}

mod_info_cards_server <- function(input, output, session, .data) {
  ns <- session$ns
  
  output$info_cards <- renderUI({
    map(1:nrow(.data), function(i) {
      width <- floor(12 / nrow(.data))
      div(
        class = str_c("col-lg-", width, " pad-bot"),
        mod_info_card_ui(ns(str_c("info_card", i)))
      )
    })
  })
  
  map(1:nrow(.data), function(i) {
    .data %>%
      slice(i) %$%
      callModule(
        mod_info_card_server, str_c("info_card", i),
        value = value,
        name = name,
        gain = gain,
        ico = ico,
        color = color
      )
  })
  
}
