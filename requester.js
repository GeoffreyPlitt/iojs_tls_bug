var http = require('http');
var https = require('https');
var debug = require('debug')('requester');

var mem_leak = [];

module.exports = function(method, scheme, host, path, params, cb) {
  // uncomment to simulate memory leak;
  // mem_leak.push(new Array(Math.pow(10,6)));

  if(!params) params = {};
  var params_str = JSON.stringify(params);

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
    timeout: 0,
    method: method,
    hostname: host,
    port: port,
    path: path,
    agent: false, // no pooling
    headers: {
      'Content-Length': params_str.length,
      'Content-Type': 'application/json'
    }
  };

  function result_handler(err, status_code, body) {
    var ret = null;

    // timing reports/warnings
    var end = new Date();
    var time_seconds = (end-start)/1000.0;
    start = null;
    end = null;
    var timing_report =time_seconds.toFixed(1) + 's for ' + method + ' ' + path;
    debug('TIMING:', timing_report);

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
      var err_str = err.toString() + ' with ' + options.method + ' ' + options.path + ' ' + params_str;
      if(body) err_str += ' : ' + body;
      err = new Error(err_str);
      err.status_code = status_code;
      cb(err);
    } else {
      // basic logging
      debug(options.method, options.hostname + options.path, 'sent:', params_str, 'received:', JSON.stringify(ret));
      //debug('HEADERS:', options.headers);
      cb(null, ret);
    }
  }

  var start = new Date();
  var req = request_lib.request(options, function(res){
    var body = '';
    res.on('data', function(chunk) {body += chunk;});
    res.on('end', function() {
      var status_code = res.statusCode;
      res.removeAllListeners();
      req.removeAllListeners();
      req.head = null;
      req = null;
      res = null;
      result_handler(null, status_code, body);
    });
  });
  req.on('error', function(err) {
    req.removeAllListeners();
    res.removeAllListeners();
    req.head = null;
    req = null;
    res = null;
    result_handler(err, null, null);
  });
  req.end(params_str);
}
