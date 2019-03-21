# SHINING A LIGHT ON U.S. HOUSEHOLD SOLAR GENERATION
# DATA ASSEMBLY SCRIPT
#
# DESCRIPTION
# 1. Loads .RData file in /data/raw-data
#       - This is from static portfolio - https://github.com/jtanwk/us-solar
# 2. Outputs 3 json or geojson files in ../data/processed-data
# 3. script.js file reads in json files for chart


########## SETUP ##########

# Data analysis libraries
library(tidyverse)
library(magrittr) # extended pipe functionality
library(lubridate) # dealing with date objects
library(here) # for OS-agnostic filepaths
library(readxl) # for reading Excel files
library(jsonlite)

# Geospatial tools and related libraries
library(sf)
library(zipcode) # for geocoding zipcodes
library(noncensus) # for more geocoding data 
library(rnaturalearth)
library(rnaturalearthdata)
library(geojsonio) # for exporting topojson data
library(rmapshaper) # for simplifying geometries

# Load previously-imported data
set_here(path = '..')
load(here('..', 'data', 'raw-data', 'solar_data_master.RData'))

########## PLOT 1: SOLAR ENERGY GENERATION BY SOURCE, YEAR ##########

line <- gen %>%
  mutate(source = ifelse(source == "Electric Utility", "Utility", source)) %>%
  group_by(Year, source, energy_type) %>% 
  summarize(total_btu = sum(Data)) %>% 
  rename(year = Year) %>%
  mutate(full_source = paste0(tolower(energy_type), tolower(source))) %>%
  mutate(highlight_col = ifelse(source == "Residential", "2",
                                ifelse(energy_type == "Solar", "1", "0"))) %>%
  ungroup() %>%
  select(year, full_source, total_btu) %>%
  arrange(full_source, year) %>%
  spread(key = full_source, value = total_btu) %>%
  mutate(solarresidential = ifelse(is.na(solarresidential), 0, solarresidential))

write_json(line, here('..', 'data', 'processed-data', 'gen-by-year.json'), pretty = TRUE)

########## PLOT 2, PLOT 3, PLOT 4 ##########

gen %>%
  filter(Year == 2016) %>%
  filter(source == "Residential") %>%
  group_by(StateCode) %>%
  summarize(total_btu = sum(Data)) %>%
  left_join(pop %>%
              filter(year == 2016) %>%
              ungroup() %>%
              select(state, total_pop),
            by = c("StateCode" = "state")) %>%
  left_join(ghi %>% 
              mutate(StateCode = state.abb[match(State, state.name)]) %>%
              filter(period == "Ann", !is.na(avg)) %>%
              select(StateCode, avg),
            by = c("StateCode" = "StateCode")) %>%
  left_join(panels_by_pop %>%
              filter(year == 2016) %>%
              select(state, panels_per_10k),
            by = c("StateCode" = "state")) %>%
  mutate(btu_per_10k = (total_btu / total_pop) * 10000) %>%
  mutate(dev_fr_median = btu_per_10k / median(btu_per_10k, na.rm = TRUE)) %>%
  filter(dev_fr_median != 0) %>% # SD and ND mess with log scale; omit
  mutate(region = state.region[match(StateCode, state.abb)]) %>%
  select(StateCode, region, avg, btu_per_10k, dev_fr_median, panels_per_10k) %>%
  rename(state = StateCode,
         sun = avg) %>%
  write_json(here('..', 'data', 'processed-data', 'gen-ghi-panels-2016.json'),
             pretty = TRUE)

########## PLOT 5: 2016 PANELS PER 10K VS. SOLAR IRRADIANCE BY COUNTY ##########

county_map %>%
  mutate(STATEFP = as.character(STATEFP),
         GEOID = as.character(GEOID)) %>%
  select(STATEFP, COUNTYFP, GEOID, geometry) %>%
  left_join(us_states %>%
              select(fips, postal) %>%
              mutate(fips = substr(fips, 3, 4)) %>%
              st_set_geometry(NULL),
            by = c("STATEFP" = "fips")) %>%
  left_join(ghi %>%
              filter(period == "Ann") %>%
              select('State FIPS', avg) %>%
              rename(StateFIPS = 'State FIPS') %>%
              mutate(StateFIPS = as.character(
                ifelse(nchar(StateFIPS) == 1, 
                       paste0('0', StateFIPS),
                       StateFIPS)
              )),
            by = c("STATEFP" = "StateFIPS")) %>%
  left_join(zip_codes %>%
              select(fips, zip),
            by = c("GEOID" = "fips")) %>%
  left_join(panels %>%
              group_by(zipcode) %>%
              count(),
            by = c("zip" = "zipcode")) %>%
  left_join(counties %>%
              mutate(geoid = paste0(state_fips, county_fips)) %>%
              select(geoid, population, county_name),
            by = c("GEOID" = "geoid")) %>%
  group_by(GEOID) %>%
  mutate(total_n = sum(n, na.rm = TRUE)) %>%
  mutate(panels_per_10k = 10000 * (total_n / population)) %>%
  mutate(panels_per_10k = ifelse(is.na(panels_per_10k), 0, panels_per_10k)) %>%
  select(GEOID, county_name, postal, avg, panels_per_10k, geometry) %>%
  unique() %>%
  rename(sun = avg) %>%
  arrange(desc(panels_per_10k)) %>% 
  ms_simplify() %>%
  topojson_write(file = here('..', 'data', 'processed-data', 'map-data.topojson'))
