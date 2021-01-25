const React = require('react');
const Icon = require('@vizality/components/Icon').default;

const fa = require('./FontAwesome');

const WrappedIcon = new Proxy(Icon, {
  get: (target, prop, receiver) => {
    if (Reflect.has(target, prop)) {
      return Reflect.get(target, prop, receiver);
    }
    if (prop === 'FontAwesome') return fa;
    return (props) => React.createElement(Icon, { name: prop, ...props });
  },
  set: (target, prop, value) => {
    return target[prop] = value;
  }
});

// WrappedIcon.badges = require('@vizality/components').Icon.badges;

module.exports = WrappedIcon;
