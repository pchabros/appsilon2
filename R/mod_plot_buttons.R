mod_plot_buttons_ui <- function(id) {
  ns <- NS(id)
  uiOutput(ns("buttons"))
}

mod_plot_buttons_server <- function(input, output, session, choices, selected) {
  ns <- session$ns
  
  output$buttons <- renderUI({
    fluidRow(
      class = "plot-buttons",
      column(
        width = 4,
        selectInput(
          inputId = ns("date"),
          label = "", 
          choices = choices
        )
      ))
  })
  
  observe({ selected(input$date) })
}
