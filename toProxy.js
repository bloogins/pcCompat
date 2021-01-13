module.exports = function toProxy (t, props) {
  return new Proxy(t, {
    get: (target, prop) => {
      if (Object.keys(props).includes(prop)) {
        return props[prop];
      }
      return target[prop];
    },
    set: (target, prop, value) => {
      if (Object.keys(props).includes(prop)) {
        return props[prop] = value;
      }
      return target[prop] = value;
    }
  });
}