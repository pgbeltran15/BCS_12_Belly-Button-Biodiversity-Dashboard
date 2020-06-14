function titleCase(str) {
  // Custom function to convert a string to Titlecase string
  return str.toLowerCase().split(' ').map(function (word) {
    return (word.charAt(0).toUpperCase() + word.slice(1));
  }).join(' ');
};

function buildMetadata(sample) {
  //Function to build the Demographic info on the web page for the passed 'sample' data
  //console.log(sample);

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

    console.log(metadataResult[0]);
    console.log(Object.keys(metadataResult[0]));
    console.log(Object.values(metadataResult[0]));
    console.log(Object.entries(metadataResult[0]));

    // Loop through the key, value pairs to create a meta data list
    Object.entries(metadataResult[0]).forEach(([key, value]) => {
      var listItem = list.append("li");
      listItem.html("<strong>" + titleCase(key) + ": " +"</strong>" + value);
    });
  });
};

function buildCharts(sample) {
  //Function to build the Charts (Horizontal Bar and Bubble) info on the web page for the passed 'sample' data

  // Query the json data to get the metadata corespoding to the 'sample' data passed
  d3.json("samples.json").then((samplesData) => {
    var sampleResponse = samplesData.samples.filter(sampleObj => sampleObj.id == sample);
    response = sampleResponse[0]

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
    };

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

    // Create the horizontal Bar plot
    Plotly.newPlot("bar", bar_trace);

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
};

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

    // Build the Demographic Metadata display
    buildMetadata(firstSampleName);

    // Build the Charts (Bar and Bubble)
    buildCharts(firstSampleName);

  });
};

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
};

// Call the init() function to intialize the dashbaord
init();