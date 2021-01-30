library(shiny)
library(dplyr)
library(tidyr)
library(jsonlite)
library(magrittr)
library(purrr)
library(stringr)
library(tidyr)
library(wrapr)

button <- function(id, img) {
  HTML(str_c('
    <button id="', id, '" type="button" class="btn btn-default action-button shiny-bound-input">
      <img src="', img, '.png" />
    </button>
  '))
}

generate_data <- function() {
  
  set.seed(123)
  
  cards <- data.frame(
    value = c("$ 2 674 862", "657", "245", "12"),
    name = c("TOTAL PROFIT", "ACTIVE USERS", "NEW ORDERS", "OPEN COMPLAINTS"),
    gain = c("+4,5%", "+8,5%", "+3,9%", "-5,3%"),
    ico = c("database", "user", "box-open", "ellipsis-h"),
    color = c("#70a1d7", "#a1de93", "#f7f48b", "#f47c7c")
  )
  
  line_bar_plot <-
    month.name %>%
    str_to_upper() %>%
    str_c(" 2018") %>%
    map_df(function(.date) {
      data.frame(x = 1:26) %>%
        mutate(
          x_sin = sin(x * (1 - x / runif(1, 90, 110))),
          y = x_sin - min(x_sin) * rpois(length(x), 5),
          y_min = y - rpois(length(x), 3),
          y_max = y + rpois(length(x), 2),
          y_d = y_max - y_min,
          b_min = y_min + y_d * runif(1, min = 0.5),
          b_max = y + rpois(length(x), 20),
          line = x_sin * 2 + mean(b_max - b_min),
          s_min = y_min,
          s_max = b_max
        ) %.>%
        bind_rows(
          select(., x, min = s_min, max = s_max) %>% mutate(bar = "shadow"),
          select(., x, min = b_min, max = b_max, line) %>% mutate(bar = "blue"),
          select(., x, min = y_min, max = y_max) %>% mutate(bar = "yellow")
        ) %>%
        mutate(date_ = .date)
    })
  
  map <-
    month.name %>%
    str_to_upper() %>%
    str_c(" 2018") %>%
    map_df(function(.date) {
      data.frame(country = c("USA", "BRA", "ESP", "GER", "SWE")) %>%
        mutate(
          value = rpois(length(country), 10),
          date_ = .date
        )
    })
  
  bar_plot <-
    str_c(1:12, " MONTH") %>%
    map_df(function(months) {
      data.frame(
        total_profit = rpois(1, 80),
        active_users = rpois(1, 65),
        new_orders = rpois(1, 90),
        open_complaints = rpois(1, 5)
      ) %>%
        pivot_longer(
          cols = everything(),
          names_to = "measure"
        ) %>%
        mutate(
          delta_pct = runif(length(value), max = 0.25),
          delta = value * delta_pct,
          sign = if_else(measure == "open_complaints", "-", "+")
        ) %>%
        pivot_longer(
          cols = c(value, delta),
          names_to = "group"
        ) %>%
        group_by(measure) %>%
        mutate(
          x_max = cumsum(value),
          x_min = x_max - value
        ) %>%
        ungroup() %>%
        mutate_at(
          vars(x_min, x_max), function(v) if_else(
            .$group == "delta" & .$sign == "-", v - .$value, v
          )
        ) %>%
        mutate(
          lab = str_c(sign, round(delta_pct * 100), "%"),
          color = case_when(
            group == "value" ~ rgb(0.8, 0.8, 0.8),
            measure == "total_profit" ~ "#70a1d7",
            measure == "active_users" ~ "#a1de93",
            measure == "new_orders" ~ "#f7f48b",
            measure == "open_complaints" ~ "#f47c7c"
          )
        ) %>%
        mutate(date_ = months)
    })
  
  return(list(
    cards = cards,
    line_bar_plot = line_bar_plot,
    bar_plot = bar_plot,
    map = map
  ))
  
}
