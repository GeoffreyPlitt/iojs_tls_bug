console.log('NODE VERSION:', process.version);

var assert = require('assert');
var memwatch = require('memwatch');
var http = require('http');
var https = require('https');

var TEST_DURATION_SECONDS = 15;
var CONCURRENCY = 16;

// ---- MEMORY LEAK HELPERS ----

memory_leak_begin = function() {
  global.gc();
  var mu = process.memoryUsage();
  var hd = new memwatch.HeapDiff();
  return [mu, hd];
}

memory_leak_end = function(context) {
  global.gc();
  var mem_before = context[0];
  var hd = context[1];
  var diff = hd.end();
  diff.change.details = diff.change.details.filter(function(x){return x['+']>100;})
  diff.change.details = diff.change.details.sort(function(a,b){return b['+'] - a['+'];})

  var mem_after = process.memoryUsage();
  var mem_deltas = {
    rss: mem_after.rss - mem_before.rss,
    heapTotal: mem_after.heapTotal - mem_before.heapTotal,
    heapUsed: mem_after.heapUsed - mem_before.heapUsed
  }
  if(mem_deltas.heapUsed>0 || mem_deltas.heapUsed.heapTotal>0) {
    console.error('memwatch diff:', JSON.stringify(diff, null, 2));
    console.error('mem_deltas:', mem_deltas)
    assert(false, 'diff > 0');
  }
}

// ---- MAKING REQUESTS ----

function make_request(method, scheme, host, path, cb) {
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

  request_lib.request(options, cb).end();
}

// ---- SIMULATOR ----

// makes requests over and over;
// records memory halfway through, and at end, and compares.
function run_simulation(scheme, done) {
  var mem_before = null;

  var stop = false;
  function loop(err) {
    //assert.equal(null, err);
    if(stop) return;
    var path = '';
    make_request('GET', scheme, 'google.com', '/', loop);
  }
  for(var i=0; i<CONCURRENCY; i++) {
    loop();
  }

  // halfway through, store initial values
  setTimeout(function() {
    mem_before = memory_leak_begin();
  }, TEST_DURATION_SECONDS/2*1000);

  // at end, do final calculations
  setTimeout(function() {
    stop = true;
    setTimeout(function() {
      memory_leak_end(mem_before);
      done();
    }, 2*1000);
  }, TEST_DURATION_SECONDS*1000);
}

describe('iojs http/https investigation', function() {
  it('run simulation with http', function(done) {
    this.timeout((TEST_DURATION_SECONDS+5)*1000);
    run_simulation('http', done);
  });
  it('run simulation with https', function(done) {
    this.timeout((TEST_DURATION_SECONDS+5)*1000);
    run_simulation('https', done);
  });
});
