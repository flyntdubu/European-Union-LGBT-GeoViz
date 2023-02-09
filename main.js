// Default Query
var selectedQ = "Job Discrim. Laws (Sexual Orientation)";

d3.json("custom.geo.json", (json) => {
  d3.csv("LGBTRights_ByCountryEurope_postoncanvas.csv", (csv) => {
    // Anchor for svg to latch onto
    var svgAnchor = d3.select("#svganchor");

    // Donut tooltip
    var donutTip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    var width = 600;
    var height = 490;

    // Default active country to nothing
    var active = d3.select(null);

    var svg = svgAnchor
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .classed("mapground", true);

    // Scale and center projection around EU
    let projection = d3
      .geoMercator()
      .center([0, 0])
      .translate([200, 750])
      .scale(420);

    let path = d3.geoPath().projection(projection);

    var mapG = svg.append("g");

    var tooltip = svgAnchor.append("div").attr("class", "tooltip");

    // Function to show the tooltip on hover
    function showTooltip(d) {
      if (d3.select(this).attr("class") === "no") return;

      var left = d3.event.pageX;
      var top = d3.event.pageY - 50;

      tooltip
        .html(d["properties"]["admin"])
        .attr("style", "left:" + left + "px; top:" + top + "px");
    }

    // Function to hide the tooltip
    function hideTooltip() {
      tooltip.transition().duration(100).style("opacity", 0);
    }

    var countryG = mapG
      .selectAll("path")
      .data(json["features"])
      .enter()
      .append("g");

    countryG
      .append("path")
      .attr("d", path)
      .attr("stroke", "black")
      .attr("stroke-width", ".75")
      .attr("class", "idk")
      .attr("id", function (d) {
        return d["properties"]["admin"].replace(/\s+/g, "");
      })
      .text(function (d) {
        return d["properties"]["admin"];
      })
      .on("click", function (d) {
        if (d3.select(this).attr("class") == "no") return;
        goto(d);
      })
      .on("mouseover", function () {
        if (d3.select(this).attr("class") == "no") return;
        tooltip.transition().duration(100).style("opacity", 1);
      })
      .on("mousemove", showTooltip)
      .on("mouseout", hideTooltip);

    var radios = csv.filter(function (d) {
      if (d["Country"] == "Spain") {
        if (d["Subset"] == "Gay") {
          if (d["Answer"] == "Yes") {
            return d;
          }
        }
      }
    });

    // Function to go-to a selected country
    function goto(d) {
      pathy = d3
        .select("#" + d["properties"]["admin"].replace(/\s+/g, ""))
        .node();

      d3.select("#csel").property(
        "value",
        d["properties"]["admin"].replace(/\s+/g, "")
      );

      if (d3.select(pathy).attr("class") === "no") return;

      if (active.node() === pathy) return reset();
      active.classed("curr", false);
      active = d3.select(pathy).classed("curr", true);

      var bounds = path.bounds(d),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = 0.9 / Math.max(dx / width, dy / height),
        translate = [width / 2 - scale * x, height / 2 - scale * y];

      genCharts();

      mapG
        .transition()
        .duration(750)
        .style("stroke-width", 1.5 / scale + "px")
        .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
    }

    // Function to reset back to original map
    function reset(d) {
      d3.select("#csel").property("value", "-- Select a country --");
      active.classed("curr", false);
      active = d3.select(null);

      genCharts();

      mapG
        .transition()
        .duration(750)
        .style("stroke-width", "1.5px")
        .attr("transform", "");
    }

    // To store the different sexualities
    var sexualities = [
      "Gay",
      "Lesbian",
      "Bisexualwomen",
      "Bisexualmen",
      "Transgender",
    ];

    // Pie reference used to make donut charts
    var pie = d3
      .pie()
      .value(function (d) {
        return d.value;
      })
      .sort(null);

    // Color reference to colorcode charts
    var color = d3
      .scaleOrdinal()
      .domain(["Yes", "Don`t know", "No", "NA"])
      .range(["#648FFF", "#FFB000", "#DC267F", "whitesmoke"]);

    // Legend for reference --------------------------------
    var legend = d3.select("#donutlegend");
    var legendentry = legend.append("svg").attr("width", 371);

    legendentry
      .append("rect")
      .attr("x", 0)
      .attr("y", 40)
      .attr("width", 40)
      .attr("height", 40)
      .attr("stroke", "black")
      .attr("fill", "#648FFF");

    legendentry
      .append("text")
      .attr("x", 55)
      .attr("y", 70)
      .attr("font-size", "larger")
      .style("fill", "black")
      .text("Yes");

    legendentry
      .append("rect")
      .attr("x", 100)
      .attr("y", 40)
      .attr("width", 40)
      .attr("height", 40)
      .attr("stroke", "black")
      .attr("fill", "#DC267F");

    legendentry
      .append("text")
      .attr("x", 155)
      .attr("y", 70)
      .attr("font-size", "larger")
      .style("fill", "black")
      .text("No");

    legendentry
      .append("rect")
      .attr("x", 200)
      .attr("y", 40)
      .attr("width", 40)
      .attr("height", 40)
      .attr("stroke", "black")
      .attr("fill", "#FFB000");

    legendentry
      .append("text")
      .attr("x", 255)
      .attr("y", 70)
      .attr("font-size", "larger")
      .style("fill", "black")
      .text("Don't Know");

    // ----------------------------------------

    // Function to generate pie charts for each sexuality
    sexualities.forEach(function (sex) {
      var arcwidth = 1200 / 5;
      var archeight = arcwidth;
      var margin = 0.1 * arcwidth;
      var rad = Math.min(arcwidth, archeight) / 2 - margin;
      var inRad = (arcwidth * 1) / 4;
      var chartDict = {};

      chartDict["Yes"] = 0;
      chartDict["No"] = 0;
      chartDict["Don`t Know"] = 0;
      chartDict["NA"] = 100;

      var donutG = d3.select("#donuts").append("div");

      donutG.classed("donutDiv", true);

      var container = donutG.append("svg").attr("id", sex);

      var flag = container
        .append("image")
        .attr("width", arcwidth / 2)
        .attr("height", archeight / 2)
        .attr("xlink:href", "assets/" + sex + ".jpeg")
        .attr("x", "25%")
        .attr("y", "25%")
        .attr("opacity", "80%");

      var arcSvg = container
        .attr("width", arcwidth)
        .attr("height", archeight)
        .append("g")
        .attr(
          "transform",
          "translate(" + arcwidth / 2 + "," + archeight / 2 + ")"
        );

      var data_ready = pie(d3.entries(chartDict));

      arcSvg
        .selectAll("segments")
        .data(data_ready)
        .enter()
        .append("path")
        .attr("d", d3.arc().innerRadius(inRad).outerRadius(rad))
        .attr("fill", function (d) {
          return color(d.data.key);
        })
        .attr("stroke", "black")
        .style("stroke-width", "2px")
        .style("opacity", 1)
        .on("mouseover", function (d) {
          console.log(d.data.key);
          if (d.data.key == "NA") {
            donutTip.classed("hidden", true);
            return;
          }
          donutTip.classed("hidden", false);
          donutTip.transition().duration(100).style("opacity", 1);
          let num = Math.round(d.value).toString() + "% \n" + d.data.key;
          let left = d3.event.pageX;
          let top = d3.event.pageY - 50;
          donutTip
            .html(num)
            .attr("style", "left:" + left + "px; top:" + top + "px");
        })
        .on("mousemove", function () {
          let left = d3.event.pageX;
          let top = d3.event.pageY - 50;
          donutTip.attr("style", "left:" + left + "px; top:" + top + "px");
        })
        .on("mouseout", function () {
          donutTip.transition().duration(100).style("opacity", 0);
        });

      if (sex == "Bisexualwomen") sex = "Bisexual Women";
      if (sex == "Bisexualmen") sex = "Bisexual Men";
      donutG.append("text").text(sex).style("font-weight", "bold");
    });

    // Generate radial forms to select queried question
    var form = d3
      .select("#radioholder")
      .append("form")
      .classed("qselector", true);

    radios.forEach(function (rad) {
      formp = form.append("div");
      let label = formp.append("label");
      var inp = label
        .append("input")
        .attr("type", "radio")
        .attr("value", rad["ShortName"])
        .attr("name", "questions")
        .on("click", function () {
          selectedQ = label.select("input:checked").node().value;
          genCharts();
        });
      if (rad["ShortName"] == selectedQ) inp.attr("checked", "checked");
      label.append("span").text(" " + rad["ShortenedQuestion"]);
    });

    // Call to generate maps
    updateChart();

    // Function to generate pie charts based off of given query
    function genCharts() {
      sexualities.forEach(function (sex) {
        var arcwidth = 1200 / 5;
        var archeight = arcwidth;
        var margin = 0.1 * arcwidth;
        var rad = Math.min(arcwidth, archeight) / 2 - margin;
        var inRad = (arcwidth * 1) / 4;

        var chartset = csv.filter(function (d) {
          if (active.node() == null) return;
          if (d["Country"].replace(/\s+/g, "") == active.attr("id")) {
            if (d["Subset"].replace(/\s+/g, "") == sex) {
              if (d["ShortName"] == selectedQ) {
                return d;
              }
            }
          }
        });

        let newDict = {};
        var terminate = false;

        if (chartset.length === 0) terminate = true;

        chartset.forEach(function (d) {
          newDict[d["Answer"]] = d["Percentage"];

          if (
            Number.isNaN(newDict[d["Answer"]]) ||
            newDict[d["Answer"]] === ":"
          )
            terminate = true;
        });

        if (terminate) {
          newDict["Yes"] = 0;
          newDict["No"] = 0;
          newDict["Don`t know"] = 0;
          newDict["NA"] = 100;
        } else {
          newDict["NA"] = 0;
        }

        if (newDict["Don`t know"] == null) {
          newDict["Don`t know"] = 0;
        }

        let donutPaths = d3.select("#" + sex).selectAll("path");

        let newData = pie(d3.entries(newDict));

        donutPaths.data(newData);

        donutPaths
          .enter()
          .append("path")
          .merge(donutPaths)
          .attr("d", d3.arc().innerRadius(inRad).outerRadius(rad))
          .attr("fill", function (d) {
            return color(d.data.key);
          })
          .attr("stroke", "black")
          .style("stroke-width", "2px")
          .style("opacity", 1);

        donutPaths.exit().remove();
      });
    }

    // Function to update the geoJSON to allow only EU countries to be selectable
    function updateChart() {
      var countries = [];

      d3.select("#svganchor")
        .selectAll("path")
        .attr("class", function (d) {
          var id = this.id;

          var exists = csv.filter(function (d) {
            if (d["Country"].replace(/\s+/g, "") == id) return d;
          });

          if (exists.length > 0) {
            if (countries.indexOf(id) === -1) {
              countries.push(id);
            }
            return "yes";
          } else {
            return "no";
          }
        });

      countries.sort();

      let controls = d3.select("#mapholder");

      var sel = controls
        .append("select")
        .on("change", function (d) {
          if (this.value == "-- Select a country --") reset();
          goto(d3.select("#" + this.value).data()[0]);
        })
        .attr("id", "csel");

      sel
        .classed("sele", true)
        .append("option")
        .text("-- Select a country --")
        .property("value", "-- Select a country --");

      var opts = sel
        .selectAll("option")
        .data(countries)
        .enter()
        .append("option")
        .text(function (d) {
          if (d == "UnitedKingdom") return "United Kingdom"; // Edge case for space in name
          return d;
        })
        .property("value", function (d) {
          return d;
        });
    }
  });
});
