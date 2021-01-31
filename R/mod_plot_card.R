mod_plot_card_ui <- function(id) {
  ns <- NS(id)
  uiOutput(ns("plot_card"))
}

mod_plot_card_server <- function(input, output, session, title, tools = TRUE, .data, plot_type) {
  
  ns <- session$ns
  id <- ns("") %>% str_remove("-$")
  
  selected <- reactiveVal()
  
  data_filtered <- reactive({
    if (is.null(selected())) selected(.data$date_[1])
    .data %>% filter(date_ == selected())
  })
  
  output$plot_card <- renderUI({
    div(
      class = "card plot-card", id = id,
      fluidRow(
        class = "card-panel",
        div(
          class = "col-12 panel-title",
          span(title),
          if (tools) {
            div(
              class = "card-tools float-right",
              map(
                c("expand", "minimize"),
                ~button(ns(.x), .x)
              )
            )
          }
        )
      ),
      fluidRow(
        class = "card-body",
        HTML(str_c('<svg id="', id, '-plot"></svg>'))
      ),
      mod_plot_buttons_ui(ns("plot_buttons"))
    )
  })
  
  session$onFlushed(function() {
    session$sendCustomMessage(plot_type, list(
      id = str_c(id, "-plot"), data = toJSON(isolate(data_filtered()))
    ))
  })
  
  observe({
    session$sendCustomMessage(plot_type, list(
      id = str_c(id, "-plot"), data = toJSON(data_filtered())
    ))
  })
  
  observeEvent(input$expand, {
    session$sendCustomMessage("expand_toogle", id)
  })  
  
  observeEvent(input$minimize, {
    session$sendCustomMessage("minimize_toogle", id)
  })
  
  callModule(
    mod_plot_buttons_server, "plot_buttons",
    choices = unique(.data$date_), selected = selected
  )
  
}
