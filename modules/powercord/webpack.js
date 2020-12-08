const wp = require('@vizality/webpack');

const getModule = (filter, retry = true, forever = false) => {
  if (filter instanceof Array) {
    return wp.getModule(...filter, retry, forever);
  }
  return wp.getModule(filter, retry, forever);
};

const getAllModules = (filter) => {
  if (filter instanceof Array) {
    return wp.getModules(...filter);
  }
  return wp.getModules(filter);
};

module.exports = { ...wp, getModule, getAllModules };
