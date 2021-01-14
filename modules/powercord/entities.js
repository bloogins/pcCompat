const entities = require('@vizality/entities');
const toProxy = require('../../toProxy');

class Plugin extends entities.Plugin {
    constructor (...props) {
        super(...props)
        this._isPCCompat = true
        if (this.start !== Plugin.prototype.start) {
            this.__pcCompatStart = this.start
            this.start = Plugin.prototype.start
        }
        if (this.stop !== Plugin.prototype.stop) {
            this.__pcCompatStop = this.stop
            this.stop = Plugin.prototype.stop
        }
    }
    start (...args) {
        this.start = this.__pcCompatStart
        return this.startPlugin(...args)
    }
    stop (...args) {
        this.stop = this.__pcCompatStop
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
