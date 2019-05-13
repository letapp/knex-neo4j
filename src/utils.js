const isObject = (obj) => typeof obj === 'object' && obj !== null;
const condStr = (condition, str) => (condition ? str : '');

function attachExtensions(toolbox, namespace, extensions) {
  if (!isObject(toolbox.extensions)) {
    toolbox.extensions = {};
  }

  Object.assign(toolbox.extensions, { [namespace]: extensions });
}

function buildCommand(args) {
  return args.filter((item) => !!item).join(' ');
}

function splitStrAtIndex(str, index, removeTarget) {
  return [
    str.substring(0, index),
    str.substring(removeTarget ? index + 1 : index),
  ];
}

// Ensure that we have 2 places for each of the date segments.
function padDate(segment) {
  segment = segment.toString();
  return segment[1] ? segment : `0${segment}`;
}

// Get a date object in the correct format, without requiring a full out library
// like "moment.js".
function yyyymmddhhmmss() {
  const d = new Date();
  return [
    d.getFullYear().toString(),
    padDate(d.getMonth() + 1),
    padDate(d.getDate()),
    padDate(d.getHours()),
    padDate(d.getMinutes()),
    padDate(d.getSeconds()),
  ].join('');
}

function invariant(testValue, error) {
  if (testValue) {
    throw new Error(`Invariant violation:\n${error}`);
  }
}

module.exports = {
  attachExtensions,
  isObject,
  condStr,
  buildCommand,
  splitStrAtIndex,
  yyyymmddhhmmss,
  invariant,
};
