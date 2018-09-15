const argumentParser = require("./lib/argumentParser");
const Checker = require("./Checker");
const queryParser = require("../../lib/queryParser");
const ModuleManager = require("../../core/moduleManager");
const multiPartParser = require("./lib/multipartParser");

var argsStorage = {};

module.exports = function(req) {
    return new Promise((resolve, reject) => {
        var executer = this.$executer;
        Checker.registerChecker(this.$eventName, executer);
        var argList = prepareArgList(this.$eventName, executer);
        getDataFromRequest(argList, req, (data, err) => {
            if (err != null) reject(err);
            err = Checker.checkData(this.$eventName, data);
            if (err != null) reject(err);
            var standardInput = resortDataIndex(data, argList);
            resolve(standardInput);
        });
    });
};

function prepareArgList(name, func) {
    var res = argsStorage[name];
    if (res == null) {
        res = argumentParser(func.toString());
        argsStorage[name] = res;
    }
    return res;
}

function getDataFromRequest(argList, req, onComplete) {
    var method = req.method;
    if ((method == "GET") | (method == "HEAD") | (method == "DELETE")) {
        getQueryData(req, onComplete);
    } else if ((method == "POST") | (method == "PUT")) {
        getBodyData(argList, req, onComplete);
    } else if (ModuleManager.getConfig("enableRESTFul")) {
        getRestData(req, argList[0], onComplete);
    }
}

function getQueryData(req, onComplete) {
    var data = queryParser.getQuery(req.url);
    onComplete(data);
}

function getBodyData(argList, req, onComplete) {
    var reqBodyType = req.headers["content-type"];
    if (reqBodyType == "application/x-www-form-urlencoded") {
        req.on("data", chunk => {
            var data = queryParser.getQuery("?" + chunk.toString());
            onComplete(data);
        });
    } else if (reqBodyType.startsWith("multipart/form-data")) {
        multiPartParser(req, argList, onComplete);
    } else {
        req.on("data", chunk => {
            onComplete(chunk);
        });
    }
}

function getRestData(req, argName, onComplete) {
    var url = req.url;
    var res = url.substr(url.lastIndexOf("/"));
    var output = {};
    output[argName] = res;
    onComplete(output);
}

function resortDataIndex(data, argList) {
    if (data == null) return data;
    var resortInput = [];
    argList.forEach(key => {
        resortInput.push(data[key]);
    });

    return resortInput;
}