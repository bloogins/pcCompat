
const { React } = require('@vizality/react');
const Icon = require('@vizality/components/Icon');
const WrappedIcon = (props) => React.createElement(Icon, props);
Icon.Names.forEach(name => WrappedIcon[name] = (props) => React.createElement(Icon, { name, ...props }));

WrappedIcon.FontAwesome = require('./FontAwesome');
WrappedIcon.badges = require('@vizality/components').Icon.badges;

module.exports = WrappedIcon;
