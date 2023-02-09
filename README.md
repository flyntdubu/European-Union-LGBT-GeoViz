# European-Union-LGBT-GeoViz

Hybrid map + donut chart to visualize the results of an EU LGBT rights survey

## Design

Visualization is split up into three components:

- Map Selector: an overhead map which can be used to select a country to query; will zoom focus and highlight on any selected country

- Question Selector: a radial menu used to select from the different questions within the survey

- Donut Charts: a set of five "donut chart" visualizations, displaying the survey answers across the five different demographics (Gay, Lesbian, Bi-Men, Bi-Women, and Transgender)

## Use

Python is needed for running the application locally, and can be downloaded [here](https://www.python.org/downloads/)

To run the application, run 
```
python3 -m http.server 8080
``` 
inside of the root directory. In any web browser of your choice, go to http://localhost:8080 to find the project.

## Examples

