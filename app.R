source("R/global.R")

ui <- fluidPage(
  includeScript("www/minimize_toogle.js"),
  includeScript("www/expand_toogle.js"),
  includeScript("www/line_bar_plot.js"),
  includeScript("www/world_map.js"),
  includeScript("www/bar_plot.js"),
  includeScript("www/d3.min.js"),
  includeScript("www/global.js"),
  includeCSS("www/info_card.css"),
  includeCSS("www/plot_card.css"),
  includeCSS("www/plots.css"),
  includeCSS("www/remove.js"),
  includeCSS("www/style.css"),
  includeCSS("www/maps.css"),
  tagList(
    fluidPage(
      title = "",
      div(
        class = "wrapper",
        span(class = "title", "Enterprise Shiny Dashboard"),
        div(style = "height: 50px;"),
        mod_info_cards_ui("top"),
        div(style = "height: 10px;"),
        fluidRow(
          id = "plots-area",
          div(
            id = "plots-col",
            class = "col-lg-6",
            fluidRow(column(width = 12, mod_plot_card_ui("production_plot"))),
            fluidRow(column(width = 12, mod_plot_card_ui("summary")))
          ),
          div(class = "col-lg-6", mod_plot_card_ui("world_map"))
        )
      )
    )
  )
)

server <- function(input, output) {
  
  .data <- generate_data()
  
  callModule(mod_info_cards_server, "top", .data = .data$cards)
  callModule(
    mod_plot_card_server, "production_plot",
    title = "PRODUCTION",
    .data = .data$line_bar_plot,
    plot_type = "line_bar_plot"
  )
  callModule(
    mod_plot_card_server, "summary",
    title = "SUMMARY",
    .data = .data$bar_plot,
    plot_type = "bar_plot"
  )
  callModule(
    mod_plot_card_server, "world_map",
    title = "SALES REVENUE BY COUNTRY",
    .data = .data$map,
    plot_type = "world_map",
    tools = FALSE
  )
  
}

shinyApp(ui = ui, server = server)
