const { join } = require('path');
const { rename } = require('fs').promises
const { Plugin } = require('@vizality/entities');
const mod = require('module');
const restoreLocalStorage = require('./localStorage');
const toProxy = require('./toProxy');

module.exports = class PCCompat extends Plugin {
  async start () {
    if (!__dirname.endsWith('00pccompat')) {
      await rename(__dirname, join(__dirname, '..', '00pccompat'))
      window.location.reload()
    }
    
    const { Icon } = require('@vizality/components');
    Icon.type({ name: 'Discord' });

    this._fontAwesome = document.createElement('link');
    this._fontAwesome.setAttribute('rel', 'stylesheet');
    this._fontAwesome.setAttribute('href', 'https://kit-pro.fontawesome.com/releases/v5.15.1/css/pro.min.css');
    document.head.appendChild(this._fontAwesome);

    this.path = join(__dirname, 'modules');
    mod.globalPaths.push(this.path);
    window.powercord = toProxy(vizality, {
      pluginManager: toProxy(vizality.manager.plugins, {
        getPlugins: () => vizality.manager.plugins.items,
        get plugins() { return vizality.manager.plugins.items }
      }),
      styleManager: toProxy(vizality.manager.themes, {
        getStyles: () => vizality.manager.themes.items,
        get styles() { return vizality.manager.themes.items }
      }),
      api: toProxy(vizality.api, {
        settings: toProxy(vizality.api.settings, {
          registerSettings: (id, opts) => vizality.api.settings._registerSettings({
            id,
            ...opts
          }),
          unregisterSettings: (id) => {
            vizality.api.settings._unregisterSettings(id);
          }
        }),
        i18n: toProxy(vizality.api.i18n, {
          loadAllStrings: vizality.api.i18n.injectAllStrings,
          loadStrings: vizality.api.i18n.injectStrings
        })
      })
    });

    restoreLocalStorage();

    const toReload = this.settings.get('tempDisabled', []);
    toReload.forEach((e) => {
      try {
        vizality.manager.plugins.enable(e);
      } catch (e) {
        this.log(e);
      }
    });
    this.settings.set('tempDisabled', []);
  }

  stop () {
    const tempDisabled = [];
    vizality.manager.plugins.items.forEach((e, i) => {
      try {
        const plugin = vizality.manager.plugins.items.get(i);
        if (e.startPlugin) {
          if (vizality.manager.plugins.isEnabled(i)) {
            vizality.manager.plugins.disable(i);
            tempDisabled.push(i);
            this.log('Stopped ', i);
            delete plugin.__proto__.start;
            delete plugin.__proto__.stop;
            delete plugin.__proto__.loadStylesheet;
            delete plugin.entityID
          }
        }
      } catch (e) {
        this.log('Ignoring error shutting down, caused by external plugin', e);
      }
    });

    this.settings.set('tempDisabled', tempDisabled);
    delete vizality.manager.plugins.mount;
    mod.globalPaths = mod.globalPaths.filter(x => x !== this.path);
    Object.keys(require.cache).filter(x => x.includes('/modules/powercord'))?.forEach((x) => delete require.cache[x]);
    delete window.powercord;
    delete window.localStorage;
    this._fontAwesome.remove();
  }
};
