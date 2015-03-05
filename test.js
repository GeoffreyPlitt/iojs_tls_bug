"use strict";

var debug = require('debug')('iojs_tls_bug');
var assert = require('assert');
var memory_tests = require('./memory_tests');
var requester = require('./requester')

var TEST_DURATION_SECONDS = 15;
var CONCURRENCY = 16;

console.log('NODE VERSION:', process.version);

function run_simulation(scheme, done) {
  var mem_before = null;

  var stop = false;
  function loop(err) {
    //assert.equal(null, err);
    if(stop) return;
    var path = '';
    requester('GET', scheme, 'google.com', '/', {}, loop);
  }
  for(var i=0; i<CONCURRENCY; i++) {
    loop();
  }

  // halfway through, store initial values
  setTimeout(function() {
    mem_before = memory_tests.memory_leak_begin();
  }, TEST_DURATION_SECONDS/2*1000);

  // at end, do final calculations
  setTimeout(function() {
    stop = true;
    setTimeout(function() {
      memory_tests.memory_leak_end(mem_before);
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
