module.exports = () => {
  if (window.localStorage)
  const frame = document.createElement('iframe');
  document.body.appendChild(frame);
  window.localStorage = Object.getOwnPropertyDescriptor(frame.contentWindow, 'localStorage').get.call(window);
  frame.remove();
};
