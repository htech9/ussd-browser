class ConfigManager
{
    static CONFIG_KEY() {
        return CONFIG_KEY = 'ussd_configs'
    }

    getConfigs() {
        const configs = localStorage.getItem(this.CONFIG_KEY)
        return JSON.parse(configs) || []
    }

    addConfig(newConfigObj) {
        let currentConfigs = this.getConfigs()
        currentConfigs.push(newConfigObj)
        const data = JSON.stringify(currentConfigs)
        localStorage.setItem(this.CONFIG_KEY, data)
    }

    removeConfig(config) {
        const currentConfigs = this.getConfigs()
        const newConfigsValue = currentConfigs.filter((currentConfig) => {
        return currentConfig.name !== config.name
        })
        const data = JSON.stringify(newConfigsValue)
        localStorage.setItem(this.CONFIG_KEY, data)
    }

    removeAll() {
        localStorage.removeItem(this.CONFIG_KEY)
    }
}