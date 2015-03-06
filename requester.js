var http = require('http');
var https = require('https');
var debug = require('debug')('requester');

var mem_leak = [];

module.exports = function(method, scheme, host, path, cb) {
  // uncomment to simulate memory leak;
  // mem_leak.push(new Array(Math.pow(10,6)));

  var request_lib = null;
  var port = null;
  if(scheme==='https') {
    request_lib = https;
    port = 443;
  } else {
    request_lib = http;
    port = 80;
  }

  var options = {
    method: method,
    hostname: host,
    port: port,
    path: path,
    agent: false // no pooling
  };

  function result_handler(err, status_code, body) {
    var ret = null;

    // if there was no error but status codes are wrong, make that an error.
    if(!err && (status_code<200 || status_code>=300)) {
      err = new Error('STATUS_CODE ' + status_code);
    }

    // if there's still no error, try parsing result, but capture that error
    if(!err) {
      try {
        ret = JSON.parse(body);
      } catch(ex) {
        err = ex + ' ' + body;
      }
    }

    // finally surface error or success
    if(err) {
      err = new Error(err.toString());
      err.status_code = status_code;
      cb(err);
    } else {
      cb(null, ret);
    }
  }

  var body = '';
  var start = new Date();
  var status_code = null;
  var req = null;
  var res = null;

  function res_end() {
    status_code = res.statusCode;
    req.removeListener('error', req_err);
    res.removeListener('data', res_data);
    res.removeListener('end', res_end);
    req.head = null;
    req = null;
    res = null;
    result_handler(null, status_code, body);
  }

  function res_data(chunk) {
    body += chunk;
  }

  function req_err(err) {
    req.removeListener('error', req_err);
    res.removeListener('data', res_data);
    res.removeListener('end', res_end);
    req.head = null;
    req = null;
    res = null;
    result_handler(err, null, null);
  }

  req = request_lib.request(options, function(_res){
    res = _res;
    res.on('data', res_data);
    res.on('end', res_end);;
  });

  req.on('error', req_err);
  req.end();
}
