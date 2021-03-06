const dom = require('@vizality/util/dom')
const { getModule } = require('@vizality/webpack');

// @todo make less janky
const goToOrJoinServer = (code) => {
  const inviteStore = getModule('acceptInviteAndTransitionToInviteChannel');
  const pop = getModule('popLayer');
  inviteStore.acceptInviteAndTransitionToInviteChannel(code);
  pop.popAllLayers();
};

const formatTime = (time) => {
  time = Math.floor(time / 1000);
  const hours = Math.floor(time / 3600) % 24;
  const minutes = Math.floor(time / 60) % 60;
  const seconds = time % 60;
  return [ hours, minutes, seconds ]
    .map(v => v < 10 ? `0${v}` : v)
    .filter((v, i) => v !== '00' || i > 0)
    .join(':');
};

module.exports = {
  ...require('@vizality/util/react'),
  ...dom,
  waitFor: dom.waitForElement,
  sleep: require('@vizality/util/time').sleep,
  formatTime,
  camelCaseify: require('@vizality/util/string').toCamelCase,
  goToOrJoinServer,
  rmdirRf: require('@vizality/util/file').removeDirRecursive
};
