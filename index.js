var eejs = require('ep_etherpad-lite/node/eejs/');
var padManager = require('ep_etherpad-lite/node/db/PadManager');
var async = require('ep_etherpad-lite/node_modules/async');
var express = require('ep_etherpad-lite/node_modules/express');
var db = require('ep_etherpad-lite/node/db/DB').db;
var authorManager = require("ep_etherpad-lite/node/db/AuthorManager");

function groupMatch(padGroups, userGroups) {
  var i;
  for (i = 0; i < padGroups.length; i++) {
    if (userGroups.includes(padGroups[i])) {
      return true;
    }
  }
  return false;
}

function getPadAuthors(pad, callback)
{
  var authors = [];
  async.map(pad.getAllAuthors(), function (userId, callback) {
    authorManager.getAuthorName(userId, function(err, userName) {
      if (userName) {
        authors.push(userName);
      }
      callback();
    });
  }, function() {
    callback(authors);
  });
}

function padString(value, length) {
  value = value.toString();
  while (value.length < length) {
    value = '0' + value; 
  }
  return value;
}

function formatTimestamp(timestamp) {
  var date = new Date(timestamp);
  return padString(date.getFullYear(), 4) + '-' + padString(date.getMonth() + 1, 2) + '-' + padString(date.getDate(), 2);
}

function getPadData(padId, userGroups, data, padCallback) {
  var padData = { };
  var padGroups = [];
  var padObj = { };

  async.waterfall([
    function(callback) {
      padManager.getPad(padId, function (err, pad) {
        padData.id = padId;
        padObj = pad;
        callback();
      });
    },
    function(callback) {
      getPadAuthors(padObj, function(authors) {
        padData.authors = authors.join(', ');
        callback();
      });
    },
    function(callback) {
      db.get("accessGroups:"+padId, function(err, value) {
        if (value) {
          padGroups = value.split(',');
          padData.groups = padGroups.join(', ');
        } else {
          padData.groups = '';
        }
        callback();
      });
    },
    function(callback) {
      if ((padGroups.length == 0) || groupMatch(padGroups, userGroups)) {
        data.push(padData);
      }
      callback();
    },
    function(callback) {
      db.get("title:"+padId, function(err, value) {
        if (value) {
          padData.title = value;
        } else {
          padData.title = padData.id;
        }
        callback();
      });
    },
    function(callback) {
      padObj.getLastEdit(function(err, value) {
        if (value) {
          padData.timestamp = value;
          padData.lastEdit = formatTimestamp(value);
        } else {
          padData.timestamp = 0;
          padData.lastEdit = '';
        }
        callback();
      });
    },
    function(callback){
      padCallback();
      callback();
    }
  ]);
}

function getGroups (req) {
  if (req.session && req.session.user && req.session.user.groups) {
    return req.session.user.groups;
  } else {
    return [];
  }
}

exports.expressCreateServer = function (hook_name, args, cb) {
  args.app.get('/list', function(req, res) {
    var pads = [];
    var data = [];
    var userGroups = getGroups(req);

    async.waterfall([
      function(callback){
        padManager.listAllPads(callback)
      },
      function (pads, callback) {
        async.map(pads.padIDs, function (padId, callback) {
          getPadData(padId, userGroups, data, callback);
        }, callback);
      },
      function(errs, callback){
        data.sort(function(a, b) { return b.timestamp - a.timestamp });
        var render_args = {
          pads: data,
        };
        res.send(eejs.require("ep_group_pad_list/templates/list.html", render_args));
        callback();
      }
    ]);
  });
  cb();
}
