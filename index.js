const { join } = require('path');
const { rename } = require('fs').promises;
const { Plugin } = require('@vizality/entities');
const mod = require('module');
const restoreLocalStorage = require('./localStorage');
const toProxy = require('./toProxy');

const SETTINGS_REGEX = /\(.*(\/addons\/plugins\/(.*)\/.*)\)/;

module.exports = class PCCompat extends Plugin {
  async start () {
    if (!__dirname.endsWith('00pccompat')) {
      await rename(__dirname, join(__dirname, '..', '00pccompat'));
      window.location.reload();
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
        get plugins () { return vizality.manager.plugins.items; }
      }),
      styleManager: toProxy(vizality.manager.themes, {
        getStyles: () => vizality.manager.themes.items,
        get styles () { return vizality.manager.themes.items; }
      }),
      api: toProxy(vizality.api, {
        settings: toProxy(vizality.api.settings, {
          registerSettings: (addonId, opts) => {
            const register = (vizality.api.settings.registerSettings || vizality.api.settings._registerSettings).bind(vizality.api.settings);
            if (!vizality.manager.plugins.has(addonId)) {
              [ , , addonId ] = (new Error()).stack.split('\n').slice(2, 3).match(SETTINGS_REGEX);
            }
            return register({
              addonId,
              ...opts
            });
          },
          unregisterSettings: (addonId) => {
            const unregister = (vizality.api.settings.unregisterSettings || vizality.api.settings._unregisterSettings).bind(vizality.api.settings);
            if (!vizality.manager.plugins.has(addonId)) {
              [ , , addonId ] = (new Error()).stack.split('\n').slice(2, 3).match(SETTINGS_REGEX);
            }
            return unregister(addonId);
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
    for (const e of toReload) {
      try {
        if (!vizality.manager.plugins.get(e) || !vizality.manager.plugins.isEnabled(e)) {
          await vizality.manager.plugins.mount(e);
          await vizality.manager.plugins.get(e)._load(true);
        }
      } catch (e) {
        this.log(e);
      }
    }
    this.settings.delete('tempDisabled', []);
  }

  async stop () {
    const tempDisabled = [];
    for (const [ id, e ] of vizality.manager.plugins.items) {
      try {
        if (e._isPcCompat) {
          if (vizality.manager.plugins.isEnabled(id)) {
            await vizality.manager.plugins.unmount(id, true);
            tempDisabled.push(id);
            this.log('Stopped ', id);
          }
        }
      } catch (e) {
        this.log('Ignoring error shutting down, caused by external plugin', id);
      }
    }

    this.settings.set('tempDisabled', tempDisabled);
    mod.globalPaths = mod.globalPaths.filter(x => x !== this.path);
    Object.keys(require.cache).filter(x => x.includes('/modules/powercord'))?.forEach((x) => delete require.cache[x]);
    delete window.powercord;
    delete window.localStorage;
    this._fontAwesome.remove();
  }
};
