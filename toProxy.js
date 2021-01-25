module.exports = function toProxy (t, props) {
  return new Proxy(t, {
    get: (target, prop, receiver) => {
      if (Object.keys(props).includes(prop)) {
        return props[prop];
      }
      return Reflect.get(target, prop, receiver);
    },
    set: (target, prop, value) => {
      if (Object.keys(props).includes(prop)) {
        return props[prop] = value;
      }
      return target[prop] = value;
    }
  });
}