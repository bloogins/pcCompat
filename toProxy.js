module.exports = function toProxy (t, props) {
  return new Proxy(t, {
    get: (target, prop, reciever) => {
      if (Object.keys(props).includes(prop)) {
        return props[prop];
      }
      return target[prop];
    }
  });
}