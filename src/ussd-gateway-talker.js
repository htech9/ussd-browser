class USSDGatewayTalker
{
    constructor(options) {  
        this.sessionId      = null
        this.serviceKey     = null
        this.phoneNumber    = null
        this.sequenceNumber = 0
        this.endpoint       = null
        this.languageCode   = 'ENU' // default value as reference, means English of USA
        this.authorizationHeader = null
        this.localSavable  = options.features.includes('localSave')
        this.displayOptions = options.display
        this.inputOptions   = options.input
        this.buttonOptions  = options.button
        this.paramsOptions  = options.params

        this.wrapper = new Wrapper();

        this.outputDisplay = this.wrapper.getElementById(this.displayOptions, 'outputScreenElId', true)
        this.prompt = this.wrapper.getElementById(this.inputOptions, 'promptElId', true)
        this.savedConfigPan = this.wrapper.getElementById(this.displayOptions, 'configListElId', this.localSavable)

        this.setupButtonListners(this.buttonOptions)
        this.configManager = new ConfigManager()
        if (this.localSavable) {
            this.refreshSavedConfigsDisplay()
        }
    }

    setupButtonListners(button) {
        const newSessionButton = this.wrapper.getElementById(button, 'newSessionElId', true)
        newSessionButton.onclick = () => {
            if (!this.isParametersFieldsFullyFilled()) {
                alert('Please fill all required parameters: ' + this.missingParameters().join(','))
                return
            }
            this.startNewSession()
        }

        const sendButton = this.wrapper.getElementById(button, 'sendElId', true)
        sendButton.onclick = () => {
            if (this.prompt.value.length === 0) {
                this.prompt.classList.add('is-invalid')
                return
            }
            this.prompt.classList.remove('is-invalid')
            this.sendBackResponse()
        }

        if (this.localSavable) {
            const loadConfigButton = this.wrapper.getElementById(button, 'loadConfigElId', true)
            const configInputFile  = this.wrapper.getElementById(button, 'configFileInputElId', true)
            configInputFile.addEventListener('change', (event) => {
                const loadedFile = event.target.files[0];
                const reader = new FileReader();
                reader.onload = ((theFile) => {
                    return (e) => {
                    try {
                        let json = JSON.parse(e.target.result)
                        if (!Array.isArray(json)) {
                            json = [json]
                        }
                        for (const conf of json) {
                            const {name, endpoint, serviceKey, phoneNumber, languageCode, authorizationHeader} = conf
                            this.configManager.addConfig({name, endpoint, serviceKey, phoneNumber, languageCode, authorizationHeader}) 
                        }
                        this.refreshSavedConfigsDisplay()
                    } catch (ex) {
                        alert('ex when trying to parse json = ' + ex);
                    }
                    }
                })(loadedFile)
                reader.readAsText(loadedFile)
            })
            loadConfigButton.onclick = () => configInputFile.click()

            const removeAllConfigButton = document.getElementById( button.removeAllConfigElId)
            removeAllConfigButton.onclick = () => this.removeAllConfigs()

            const saveConfigButton = this.wrapper.getElementById(button, 'saveLocalElId', true)
            saveConfigButton.onclick = () => {
                const configName = prompt('Input the name of the configuration', 'default')
                this.refreshParams()
                this.configManager.addConfig({
                    name: configName,
                    endpoint: this.endpoint,
                    serviceKey: this.serviceKey,
                    phoneNumber: this.phoneNumber,
                    authorizationHeader: this.authorizationHeader
                })
                this.refreshSavedConfigsDisplay()
            }
        }

    }

    createBodyRequest(choiceOrPrompt = null) {
        return `<methodCall><methodName>USSD_MESSAGE</methodName><params><param><value><struct><member><name>SEQUENCE</name><value><string>${this.sequenceNumber || ''}</string></value></member><member><name>END_OF_SESSION</name><value><string>FALSE</string></value></member><member><name>LANGUAGE</name><value><string>${this.languageCode || ''}</string> </value></member><member><name>SESSION_ID</name><value><string>${this.sessionId || ''}</string></value></member><member><name>SERVICE_KEY</name><value><string>${this.serviceKey || ''}</string></value></member><member><name>MOBILE_NUMBER</name><value><string>${this.phoneNumber || ''}</string></value></member><member><name>USSD_BODY</name><value><string>${choiceOrPrompt || ''}</string></value></member></struct></value></param></params></methodCall>`
    }

    responseHasOptions(output) {
        return output.match(/\n[0-9]./g)
    }

    refreshParams() {
        if (!this.paramsOptions)
            this.paramsOptions = {}

        this.serviceKey = this.paramsOptions.serviceKey || this.wrapper.getElementById(this.inputOptions, 'serviceKeyElId', true).value
        this.phoneNumber = this.paramsOptions.phoneNumber || this.wrapper.getElementById(this.inputOptions, 'phoneNumberElId', true ).value
        this.endpoint = this.paramsOptions.endpoint || this.wrapper.getElementById(this.inputOptions, 'endpointElId', true).value
        this.authorizationHeader = this.paramsOptions.authorizationHeader || this.wrapper.getElementById(this.inputOptions, 'authHeaderElId', true).value
        this.languageCode = this.paramsOptions.languageCode || this.wrapper.getElementById(this.inputOptions, 'languageCodeElId', true).value
    }

    refreshSavedConfigsDisplay() {
        this.savedConfigPan.innerHTML = ''
        const configs = this.configManager.getConfigs()
        for (const conf of configs) {
        const node = document.createElement("li")
        const textnode = document.createTextNode(conf.name + " ")
        const loadBtn = document.createElement("button")
        loadBtn.innerHTML = "load"
        loadBtn.classList = ['btn btn-sm btn-info']
        loadBtn.onclick = () => (this.loadConfig(conf))
        const deleteBtn = document.createElement("button")
        deleteBtn.innerHTML = "remove"
        deleteBtn.classList = ['btn btn-sm btn-danger']
        deleteBtn.onclick = () => (this.removeConfig(conf))
        node.appendChild(textnode)
        node.appendChild(loadBtn)
        node.appendChild(deleteBtn)
        this.savedConfigPan.append(node) 
        }
    }

    makeAndHandleRequest(body) {
        console.log('Auth', this.authorizationHeader)
        console.log('endpoint', this.endpoint)
        const headerAddon = {"Authorization": this.authorizationHeader}
        Utils.postAjax(this.endpoint, headerAddon, body, (res) => {
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(res, "text/xml")
        const jsonRsponseData = Utils.xmlToJson(xmlDoc)
        const displayText = jsonRsponseData.methodResponse.params.param.value.struct.member[4].value.string['#text']
        this.outputDisplay.value = displayText
        
        this.checkDisplayLength()
        })
    }

    checkDisplayLength() {
        const feedback = this.wrapper.getElementById(this.displayOptions, 'screenLengthOverflowId', false)
        if (!!feedback) {
            if (this.outputDisplay.value.length > 160) {
                this.outputDisplay.classList.add('is-invalid')
                feedback.removeAttribute('hidden')
            } else {
                this.outputDisplay.classList.remove('is-invalid')
                feedback.setAttribute('hidden', '')
            }
        }
    }

    isParametersFieldsFullyFilled() {
        return !!this.serviceKey && !!this.phoneNumber && !!this.endpoint && !!this.authorizationHeader
    }

    missingParameters () {
        let missing = []
        const requiredParams = [
            ['serviceKey', 'serviceKeyElId'],
            ['phoneNumber', 'phoneNumberElId'],
            ['endpoint', 'endpointElId'],
            ['authHeader', 'authHeaderElId']
        ]
        for (const p of requiredParams) {
            if (!this.paramsOptions[p[0]]) {
                    const el = this.wrapper.getElementById(this.inputOptions, p[1] , true)
                    this.paramsOptions[p[0]] = el.value;
                    if (!el || el.value.length === 0) {                    
                        missing.push(p[0]);
                        if (el) {
                            el.style = "border-color: red";
                        }
                    }
            }
        }

        return missing
    }

    startNewSession() {
        this.sessionId = Math.floor(Math.random() * 100000)
        this.sequenceNumber = 0
        this.refreshParams()
        const body = this.createBodyRequest()
        this.makeAndHandleRequest(body)
    }

    sendBackResponse() {
        this.sequenceNumber++
        const body = this.createBodyRequest(this.prompt.value)
        this.makeAndHandleRequest(body)
    }

    loadConfig(config) {
        const serviceKeyEl = this.wrapper.getElementById(this.inputOptions, 'serviceKeyElId')
        if (serviceKeyEl) serviceKeyEl.value = config.serviceKey

        const phoneNumberEl = this.wrapper.getElementById(this.inputOptions, 'phoneNumberElId')
        if (phoneNumberEl) phoneNumberEl.value = config.phoneNumber

        const endpointEl = this.wrapper.getElementById(this.inputOptions, 'endpointElId')
        if (endpointEl) endpointEl.value = config.endpoint

        const languageCodeEl = this.wrapper.getElementById(this.inputOptions, 'languageCodeElId')
        if (languageCodeEl) languageCodeEl.value = config.languageCode

        const authHeaderEl = this.wrapper.getElementById(this.inputOptions, 'authHeaderElId')
        if (authHeaderEl) authHeaderEl.value = config.authorizationHeader

        this.refreshParams()
    }

    removeConfig(config) {
        this.configManager.removeConfig(config)
        this.refreshSavedConfigsDisplay()
    }

    removeAllConfigs() {
        this.configManager.removeAll()
        this.refreshSavedConfigsDisplay()
    }
}