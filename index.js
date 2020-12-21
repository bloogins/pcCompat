const { join } = require('path');
const { rename } = require('fs').promises
const { Plugin } = require('@vizality/entities');
const { patch, unpatch } = require('@vizality/patcher');
const mod = require('module');
const modulePath = join(__dirname, 'modules');
const restoreLocalStorage = require('./localStorage');
const toProxy = require('./toProxy');

module.exports = class PCCompat extends Plugin {
  async onStart () {
    
    if (!__dirname.endsWith('00pccompat')) {
      await rename(__dirname, join(__dirname, '..', '00pccompat'))
      window.location.reload()
    }
    
    const Icon = require('@vizality/components/Icon');
    Icon.type({ name: 'Discord' });

    this._fontAwesome = document.createElement('link');
    this._fontAwesome.setAttribute('rel', 'stylesheet');
    this._fontAwesome.setAttribute('href', 'https://kit-pro.fontawesome.com/releases/v5.15.1/css/pro.min.css');
    document.head.appendChild(this._fontAwesome);

    this.path = join(__dirname, 'modules');
    mod.globalPaths.push(this.path);
    window.powercord = {
      ...vizality,
      pluginManager: toProxy(vizality.manager.plugins, {
        getPlugins: () => vizality.manager.plugins.plugins
      }),
      styleManager: toProxy(vizality.manager.themes, {
        getStyles: () => vizality.manager.themes.themes
      }),
      api: {
        ...vizality.api,
        settings: toProxy(vizality.api.settings, {
          registerSettings: (id, opts) => vizality.api.settings.registerAddonSettings({
            id,
            ...opts
          }),
          unregisterSettings: (id) => {
            vizality.api.router.unregisterRoute(`/dashboard/plugins/${id}`);
            vizality.api.settings.unregisterSettings(id);
          }
        }),
        i18n: toProxy(vizality.api.i18n, {
          loadAllStrings: vizality.api.i18n.injectAllStrings,
          loadStrings: vizality.api.i18n.injectStrings
        })
      }
    };

    restoreLocalStorage();

    const _this = this;
    patch('pcCompat-load', Plugin.prototype, '_load', function (args, ret) {
      if (this.startPlugin) {
        _this.log('Patching', this.addonId);
        this.entityID = this.addonId
        this.__proto__.onStart = this.startPlugin;
        this.__proto__.onStop = this.pluginWillUnload;
        this.__proto__.loadStylesheet = this.injectStyles;
      }
      return args;
    }, true);
    const toReload = this.settings.get('tempDisabled', []);
    toReload.forEach((e) => {
      try {
        vizality.manager.plugins.enable(e);
      } catch (e) {
        this.log('Ignoring error starting up, caused by external plugin', e);
      }
    });
    this.settings.set('tempDisabled', []);
  }

  onStop () {
    const tempDisabled = [];
    vizality.manager.plugins.plugins.forEach((e, i) => {
      try {
        const plugin = vizality.manager.plugins.plugins.get(i);
        if (e.startPlugin) {
          if (vizality.manager.plugins.isEnabled(i)) {
            vizality.manager.plugins.disable(i);
            tempDisabled.push(i);
            this.log('Stopped ', i);
            delete plugin.__proto__.onStart;
            delete plugin.__proto__.onStop;
            delete plugin.__proto__.loadStylesheet;
            delete plugin.entityID
          }
        }
      } catch (e) {
        this.log('Ignoring error shutting down, caused by external plugin', e);
      }
    });

    this.settings.set('tempDisabled', tempDisabled);
    unpatch('pcCompat-load');
    delete vizality.manager.plugins.mount;
    mod.globalPaths = mod.globalPaths.filter(x => x !== this.path);
    Object.keys(require.cache).filter(x => x.includes('/modules/powercord')).forEach((x) => delete require.cache[x]);
    delete window.powercord;
    delete window.localStorage;
    this._fontAwesome.remove();
  }
};
