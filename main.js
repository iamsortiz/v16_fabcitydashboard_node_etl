var fs = require('fs');
var request = require('request');

////////////////////////////////////////////////////////////////////////////////
///
/// Conf
///
////////////////////////////////////////////////////////////////////////////////
var target_api_url = "https://api.fablabs.io/v0/labs.json";
var source_data_local_path = 'input/fablabsio.json';
var mongolab_api_key = 'YOUR_API_KEY_HERE';

////////////////////////////////////////////////////////////////////////////////
///
/// Main method
///
////////////////////////////////////////////////////////////////////////////////
function ETL() {
  //var source_raw_data = extract_remote(target_api_url); // Extract (leer del api de fablabio)
  var source_raw_data = extract_local(source_data_local_path);

  var transformed_data =  transform(source_raw_data); // Transf (modelo fuente <-> "modelo comun")

  load(transformed_data); // Load (mongolab)
}

////////////////////////////////////////////////////////////////////////////////
///
/// Auxiliary functions
///
////////////////////////////////////////////////////////////////////////////////
function extract_remote(target_api_url) {
  request(target_api_url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      //console.log(body) // Show the HTML for the Google homepage.
      fs.writeFileSync(source_data_local_path, body, 'utf8');
    }
  });
}

function extract_local(path) {
  return fs.readFileSync(path, 'utf8');
}

function transform(source_raw_data) {
  var data_as_object = JSON.parse(source_raw_data);
  return data_as_object.labs;
}

function load(data) {
  var options = {
    url: 'https://api.mlab.com/api/1/databases/fablabetc/collections/fablabs?apiKey=' + mongolab_api_key,
    method: "POST",
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(data)
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body);
    }
  });
}

ETL();
