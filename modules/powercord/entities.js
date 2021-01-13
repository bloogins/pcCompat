const entities = require('@vizality/entities');
const badPlugins = require('../../badPlugins');
const toProxy = require('../../toProxy')

class Plugin extends entities.Plugin {
    constructor (...props) {
        super(...props)
        if (badPlugins.includes(this.__proto__.constructor.name)) {
            const toastId = `pccompat-bad-plugin-${this.addonId}`
            vizality.api.notices.sendToast(toastId, {
              header: 'Incompatible plugin!',
              content: `${this.__proto__.constructor.name} is incompatible with PCCompat.`,
              type: 'error',
              buttons: [ {
                text: `Disable ${this.__proto__.constructor.name}`,
                color: 'red',
                look: 'outlined',
                onClick: () => {
                    vizality.manager.plugins.disable(this.addonId)
                    vizality.api.notices.closeToast(toastId)
                }
              } ]
            });
            this.start = () => {}
            this.stop = () => {}
            return
        }
        this._isPCCompat = true
    }
    start (...args) {
        return this.startPlugin(...args)
    }
    stop (...args) {
        return this.pluginWillUnload(...args)
    }
    loadStylesheet (...args) {
        return super.injectStyles(...args)
    }
    get entityID() { return this.addonId }
}

module.exports = toProxy(entities, {
    Plugin
})
