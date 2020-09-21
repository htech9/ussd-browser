class Wrapper {
    getElementById(config, elIdKey, required = false) {
        const elementId = config[elIdKey]
        const element = document.getElementById(elementId);
        if (!element && required) throw new Error('Element for ' + elIdKey + ' is not found. Please specify it configuration options') ;

        return element;
    }
}