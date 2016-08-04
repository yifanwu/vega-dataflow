import add from './dataflow/add';
import connect from './dataflow/connect';
import events from './dataflow/events';
import on from './dataflow/on';
import {rank, rerank} from './dataflow/rank';
import {pulse, touch, update} from './dataflow/update';
import {ingest, request} from './dataflow/load';
import {run, runAfter, enqueue, getPulse} from './dataflow/run';
import changeset from './ChangeSet';
import Heap from './util/Heap';
import UniqueList from './util/UniqueList';
import {id, logger} from 'vega-util';

/**
 * A dataflow graph for reactive processing of data streams.
 * @constructor
 */
export default function Dataflow() {
  this._log = logger();

  this._clock = 0;
  this._rank = 0;

  this._touched = UniqueList(id);
  this._pulses = {};
  this._pulse = null;

  this._heap = new Heap(function(a, b) { return a.qrank - b.qrank; });
  this._postrun = [];
}

var prototype = Dataflow.prototype;

/**
 * The current timestamp of this dataflow. This value reflects the
 * timestamp of the previous dataflow run. The dataflow is initialized
 * with a stamp value of 0. The initial run of the dataflow will have
 * a timestap of 1, and so on. This value will match the
 * {@link Pulse.stamp} property.
 * @return {number} - The current timestamp value.
 */
prototype.stamp = function() {
  return this._clock;
};

// OPERATOR REGISTRATION
prototype.add = add;
prototype.connect = connect;
prototype.rank = rank;
prototype.rerank = rerank;

// OPERATOR UPDATES
prototype.pulse = pulse;
prototype.touch = touch;
prototype.update = update;
prototype.changeset = changeset;

// DATA LOADING
prototype.ingest = ingest;
prototype.request = request;

// EVENT HANDLING
prototype.events = events;
prototype.on = on;

// PULSE PROPAGATION
prototype.run = run;
prototype.runAfter = runAfter;
prototype._enqueue = enqueue;
prototype._getPulse = getPulse;

// LOGGING AND ERROR HANDLING

function logMethod(method) {
  return function() {
    return this._log[method].apply(this, arguments);
  };
}

/**
 * Logs a warning message. By default, logged messages are written to console
 * output. The message will only be logged if the current log level is high
 * enough to permit warning messages.
 */
prototype.warn = logMethod('warn');

/**
 * Logs a information message. By default, logged messages are written to
 * console output. The message will only be logged if the current log level is
 * high enough to permit information messages.
 */
prototype.info = logMethod('info');

/**
 * Logs a debug message. By default, logged messages are written to console
 * output. The message will only be logged if the current log level is high
 * enough to permit debug messages.
 */
prototype.debug = logMethod('debug');

/**
 * Get or set the current log level. If an argument is provided, it
 * will be used as the new log level.
 * @param {number} [level] - Should be one of None, Warn, Info
 * @return {number} - The current log level.
 */
prototype.logLevel = logMethod('level');

/**
 * Handle an error. By default, this method re-throws the input error.
 * This method can be overridden for custom error handling.
 */
prototype.error = function(err) {
  throw err;
};
