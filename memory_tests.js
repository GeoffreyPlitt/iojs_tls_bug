"use strict";

var debug = require('debug')('iron:test_memory');
var assert = require('assert');
var memwatch = require('memwatch');

exports.memory_leak_begin = function() {
  global.gc();
  var mu = process.memoryUsage();
  var hd = new memwatch.HeapDiff();
  debug('memory_leak_begin():', mu);
  return [mu, hd];
}

exports.memory_leak_end = function(context) {
  global.gc();
  var mem_before = context[0];
  var hd = context[1];
  var diff = hd.end();
  diff.change.details = diff.change.details.filter(function(x){return x['+']>100;})
  diff.change.details = diff.change.details.sort(function(a,b){return b['+'] - a['+'];})

  var mem_after = process.memoryUsage();
  debug('memory_leak_end():', mem_after);
  var mem_deltas = {
    rss: mem_after.rss - mem_before.rss,
    heapTotal: mem_after.heapTotal - mem_before.heapTotal,
    heapUsed: mem_after.heapUsed - mem_before.heapUsed
  }
  debug('mem_deltas:', mem_deltas);
  if(mem_deltas.heapUsed>0 || mem_deltas.heapUsed.heapTotal>0) {
    console.error('memwatch diff:', JSON.stringify(diff, null, 2));
    console.error('mem_deltas:', mem_deltas)
    assert(false, 'diff > 0');
  }
}
