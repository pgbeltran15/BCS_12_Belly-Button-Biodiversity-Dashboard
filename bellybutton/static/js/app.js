function titleCase(str) {
  // Custom function to convert a string to Titlecase string
  return str.toLowerCase().split(' ').map(function (word) {
    return (word.charAt(0).toUpperCase() + word.slice(1));
  }).join(' ');
}

function buildMetadata(sample) {
  //Function to build the Demographic info on the web page
  // and the Belly Button Washing Frequency gauge
  // for the passed 'sample' data

  // Query the json data to get the metadata corespoding to the 'sample' data passed
  d3.json("samples.json").then((sampleMetadata) => {
    var metadataResult = sampleMetadata.metadata.filter(sampleObj => sampleObj.id == sample);

    // Grab the reference for the panel html that will hold the data
    var panel = d3.select("#sample-metadata");
    // Clear any old data
    panel.html("");

    // Add the ul tag to the panel html document
    var list = panel.append("ul");
    // Add a class 'list-unstyled' to the list
    list.classed("list-unstyled", true);

    // Loop through the key, value pairs to create a meta data list
    Object.entries(metadataResult[0]).forEach(([key, value]) => {
      var listItem = list.append("li");
      listItem.html("<strong>" + titleCase(key) + ": " + "</strong>" + value);
    });

    // Create a trace for the gauge chart
    // Max value for the wfreq data is 9 (Use this for Guage max range)
    // Median value for the wfreq data is 2 (Use this to display the offset of the value from median)
    gauge_trace = [{
      type: "indicator",
      mode: "gauge+number+delta",
      title: {
        text: "<b>Belly Button Washing Frequency</b><br><span style='font-size:0.8em';>Subject ID #" +
          metadataResult[0].id +
          " - Scrubs per week</span><br><span style='font-size:0.6em';>Median: 2 & Max: 9</span>",
        font: { size: 18, color: "darkblue" }
      },
      domain: {
        x: [0, 5],
        y: [0, 1]
      },
      gauge: {
        axis: {
          // Setting the max of the range to 10 (max(wfreq) + 1)
          range: [null, 10],
          tickwidth: 1,
          tickcolor: "darkblue"
        },
        steps: [
          { range: [0, 1.99], color: "rgb(255,242,174)" },
          { range: [1.99, 2.01], color: "red" }, // Represents the Median value
          { range: [2.01, 4], color: "rgb(244,202,228)" },
          { range: [4, 6], color: "rgb(253,205,172)" },
          { range: [6, 8], color: "rgb(230,245,201)" },
          { range: [8, 8.99], color: "rgb(251,180,174)" },
          { range: [8.99, 9.01], color: "red" }, // Represents the Max value
          { range: [9.01, 10], color: "rgb(251,180,174)" },
        ],
        threshold: {
          line: { color: "red", width: 6 },
          thickness: 0.8,
          value: 9.95
        }
      },
      // Cast any NULL values to Zero
      value: Number(metadataResult[0].wfreq),
      // The reference value is used to display the offset of the value in display
      delta: { reference: 2, increasing: { color: "Green" } }
    }];

    // Create the layout for the gauge chart
    gauge_layout = {
      width: 520,
      height: 470,
      margin: { t: 10, r: 25, l: 15, b: 10 },
      font: { color: "darkblue" }
    };

    // Create the gauge plot
    Plotly.newPlot('gauge', gauge_trace, gauge_layout);

  });
}

function buildCharts(sample) {
  //Function to build the Charts (Horizontal Bar and Bubble) info on the web page for the passed 'sample' data

  // Query the json data to get the metadata corespoding to the 'sample' data passed
  d3.json("samples.json").then((samplesData) => {
    var sampleResponse = samplesData.samples.filter(sampleObj => sampleObj.id == sample);
    response = sampleResponse[0];

    // Create an array to store objects containing the data for each sample
    // Will be used to hold the sorted and sliced data
    plotData = [];
    // Loop through the three data arrays to create dictionaries and add them to the 'data' array
    for (i = 0; i < response.otu_ids.length; i++) {
      plotData.push({
        id: `OTU ${response.otu_ids[i]}`,
        value: response.sample_values[i],
        label: response.otu_labels[i]
      });
    }

    // Sort the 'plotData' array
    var sortedData = plotData.sort((a, b) => b.value - a.value);

    // Slice the array for the top ten values
    var topTen = sortedData.slice(0, 10);

    // Reversed the order so that the horiza=ontal bar chart can display the
    // from top to bottom in descending order
    var topTenReversed = topTen.sort((a, b) => a.value - b.value);

    // Create the trace for the bar chart for the top ten values
    var colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];
    bar_trace = [{
      type: "bar",
      orientation: 'h',
      x: topTenReversed.map(row => row.value),
      y: topTenReversed.map(row => row.id),
      text: topTenReversed.map(row => row.label),
      mode: 'markers',
      marker: {
        color: colors,
        opacity: 0.7,
        line: {
          color: 'rgb(8,48,107)',
          width: 0.2
        }
      }
    }];

    bar_layout = {
      title: `<b>Top Ten OTU Data</b><br><span style='font-size:0.8em';>Subject ID #${response.id}</span>`,
      font: { color: "darkblue" },
      yaxis: {
        autorange: true,
      },
      xaxis: {
        autorange: true,
      },
    };

    // Create the horizontal Bar plot
    Plotly.newPlot("bar", bar_trace, bar_layout);

    // Create a trace for bubble chart
    bubble_trace = [{
      x: response.otu_ids,
      y: response.sample_values,
      mode: "markers",
      marker: {
        size: response.sample_values,
        color: response.otu_ids
      },
      text: response.otu_labels
    }];

    // Create the layout for the bubble chart
    bubble_layout = {
      title: `<b>OTU Data</b><br><span style='font-size:0.8em';>Subject ID #${response.id}</span>`,
      font: { color: "darkblue" },
      xaxis: {
        autorange: true,
        type: "linear",
        title: "OTU ID"
      },
      yaxis: {
        autorange: true,
        type: "linear"
      }
    };

    // Create the bubble plot
    Plotly.newPlot("bubble", bubble_trace, bubble_layout);

  });
}

function init() {
  // Initialize Page
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Read the samples.json data and extract all the Data Sample names
  // The Data sample name array are located at json_data.names[]
  d3.json("samples.json").then((sampleNames) => {
    sampleNames.names.forEach((sampleName) => {
      selector
        .append("option")
        .text(sampleName)
        .property("value", sampleName);
    });

    // Use the first set of the sample data to build the initial plots and Metadata display
    const firstSampleName = sampleNames.names[0];

    // Build the Demographic Metadata and the Gauge display
    buildMetadata(firstSampleName);

    // Build the Charts (Bar and Bubble)
    buildCharts(firstSampleName);

  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
}

// Calculate the max and median for the Belly Button Washing frequency
// These values will be used for the Gauge
const wfreq_max = d3.json("samples.json").then((data) => {
  //console.log(wfreq_max);
  return d3.max(data.metadata.map((d) => { return d.wfreq; }));
});
const wfreq_median = d3.json("samples.json").then((data) => {
  //console.log(wfreq_median);
  return d3.median(data.metadata.map((d) => { return d.wfreq; }));
});

// Call the init() function to intialize the dashboard
// and display the data for the first value in the drop down list
init();