"use strict";

var debug = require('debug')('iojs_tls_bug');
var assert = require('assert');
var memory_tests = require('./memory_tests');
var requester = require('./requester')

var TEST_DURATION_SECONDS = 20;
var SCHEME = 'https';

describe('stress tests', function() {
  it('can run rapid simulation for a while without errors or memory leaks', function(done) {
    this.timeout((TEST_DURATION_SECONDS+1)*1000);

    var mem_before = null;

    function loop() {
      requester('GET', SCHEME, 'google.com', '/', {}, loop);
    }
    loop();

    // halfway through, store initial values
    setTimeout(function() {
      mem_before = memory_tests.memory_leak_begin();
    }, TEST_DURATION_SECONDS/2*1000);

    // at end, do final calculations
    setTimeout(function() {
      memory_tests.memory_leak_end(mem_before);
      done();
    }, TEST_DURATION_SECONDS*1000)
  });
});
