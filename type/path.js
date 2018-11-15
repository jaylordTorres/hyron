var crc = require("crc");

var pathHolder = {};
var cache = {};

function build(hyronClass, baseURL, url) {
    var reqConfig = hyronClass.requestConfig();
    var instance = new hyronClass();
    uriPaths = {};

    Object.keys(reqConfig).forEach(methodName => {
        var config = reqConfig[methodName];
        var path = url + "/" + methodName;
        if (config.uriPath != null) parh = config.uriPath;
        var handle = instance[methodName];
        if (handle != null) uriPaths[path] = handle;
    });

    if (pathHolder[baseURL] == null) pathHolder[baseURL] = uriPaths;
    else {
        Object.assign(pathHolder[baseURL], uriPaths);
    }
}

function getURL(path) {
    var completePath = cache[path];
    if (completePath != null) {
        return completePath;
    } else {
        var baseURLs = Object.keys(pathHolder);
        for (var i = 0; i < baseURLs.length; i++) {
            var registeredPaths = Object.keys(pathHolder[baseURLs[i]]);
            for (var j = 0; j < registeredPaths.length; j++) {
                var currentPath = registeredPaths[j];
                if (currentPath.endsWith(path)) {
                    completePath[path] = baseURL + "/" + currentPath;
                    return currentPath;
                }
            }
        }
    }
}

function findURL(func) {
    func = func.toString();
    var identityKey = crc.crc16(func).toString(16);
    var completePath = cache[identityKey];
    if (completePath != null) {
        return completePath;
    } else {
        var baseURLs = Object.keys(pathHolder);
        for (var i = 0; i < baseURLs.length; i++) {
            var curBaseUrl = baseURLs[i];
            var registeredPaths = Object.keys(pathHolder[curBaseUrl]);
            for (var j = 0; j < registeredPaths.length; j++) {
                var curPath = registeredPaths[j];
                var curHandle = pathHolder[curBaseUrl][curPath];
                if (curHandle.toString() == func) {
                    var completePath = curBaseUrl + curPath;
                    completePath[identityKey] = completePath;
                    return completePath;
                }
            }
        }
    }
}

module.exports = {
    build,
    findURL,
    getURL
};
