class Utils
{
    static postAjax(url, headerAddon = {}, data, success) {
        const params = typeof data == 'string' ? data : Object.keys(data).map(
                    function(k){ return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) }
              ).join('&')

        const xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP")
        xhr.open('POST', url);
        xhr.onreadystatechange = function() {
            if (xhr.readyState > 3 && xhr.status === 200) { success(xhr.responseText) }
        }
        xhr.setRequestHeader('Content-Type', 'application/xml')
        for (const [key, value] of Object.entries(headerAddon)) {
            xhr.setRequestHeader(key, value) 
        }
        xhr.send(params)
        
        return xhr;
    }

    static xmlToJson(xml) {
        var obj = {};

        if (xml.nodeType === 1) {
            if (xml.attributes.length > 0) {
                obj["@attributes"] = {};
                for (var j = 0; j < xml.attributes.length; j++) {
                  var attribute = xml.attributes.item(j);
                  obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
                }
            }
        } else if (xml.nodeType === 3) {
            obj = xml.nodeValue;
        }

        if (xml.hasChildNodes()) {
          for(var i = 0; i < xml.childNodes.length; i++) {
              var item = xml.childNodes.item(i);
              var nodeName = item.nodeName;
              if (typeof(obj[nodeName]) == "undefined") {
                  obj[nodeName] = Utils.xmlToJson(item);
              } else {
                  if (typeof(obj[nodeName].push) == "undefined") {
                      var old = obj[nodeName];
                      obj[nodeName] = [];
                      obj[nodeName].push(old);
                  }
                  obj[nodeName].push(Utils.xmlToJson(item));
              }
          }
        }

        return obj;
    }
}