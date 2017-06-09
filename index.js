const express = require('express');
const bodyParser = require('body-parser');
const snme2json = require('./snme2json');

const app = express();
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.post('/json2snme', function(req, res) {
  const { snme } = req.body;
  console.log(snme);
  let json;
  try {
      json = snme2json(snme);
      JSON.parse(json);
    } catch (error) {
      json = error;
    }
    res.end(json);
  });
app.listen(3002);
