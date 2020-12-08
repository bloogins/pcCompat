module.exports = () => {
  const frame = document.createElement('iframe');
  document.body.appendChild(frame);
  window.localStorage = Object.getOwnPropertyDescriptor(frame.contentWindow, 'localStorage').get.call(window);
  frame.remove();
};
