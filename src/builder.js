'use strict';
/**
 * Created by nick on 16/4/21.
 */

let _ = require('lodash');
let fs = require("fs");
let sailsMongoAdapter = require('sails-mongo');
let Waterline = require('waterline');

module.exports.buildORM = function (connectionName, appDefaults, cb) {
  // -> Instantiate ORM in memory.
  // -> Iterate through each model definition:
  //    -> Create a proper Waterline Collection for each model
  //    -> then register it w/ the ORM.
  console.log('Starting ORM...');
  if (!connectionName || !appDefaults) {
    return cb('miss connectionName or appDefaults')
  }
  appDefaults.connection = connectionName;
  let modelDefs = getModelDefs(connectionName);
  let waterline = new Waterline();
  _.each(modelDefs, function loadModelsIntoWaterline(modelDef, modelID) {
    console.log('Registering model `' + modelID + '` in Waterline (ORM)');
    waterline.loadCollection(Waterline.Collection.extend(modelDef));
  });

  // Find all the connections used
  let connections = getConnections(connectionName);
  let adapters = {
    'sails-mongo': sailsMongoAdapter
  };

  console.log('buildORM appDefaults', appDefaults);
  console.log('buildORM connections', connections);
  console.log('buildORM adapters', Object.keys(adapters));
  // -> "Initialize" ORM
  //    : This performs tasks like managing the schema across associations,
  //    : hooking up models to their connections, and auto-migrations.
  waterline.initialize({
    adapters: adapters,
    connections: connections,
    defaults: appDefaults
  }, function (err, orm) {
    if (err) return cb(err);
    let models = orm.collections || [];
    _.each(models, function eachInstantiatedModel(thisModel, modelID) {
      // Bind context for models
      // (this (breaks?)allows usage with tools like `async`)
      // 这一步不能少
      _.bindAll(thisModel);
    });
    // Success
    cb(null, models);
  });
};

/**
 * 读取系统的 connections 配置
 * @param connectionName 指定的连接
 * @returns {Object}
 */
function getConnections(connectionName) {
  let connections = require('../config/connections');
  let result = {};
  if (connectionName) {
    result[connectionName] = connections.connections[connectionName];
  } else {
    result = connections.connections
  }
  _.each(result, function (value, key) {
    result[key].adapter = result[key].module
  });
  return result
}

/**
 * require api/models 里面的每个对象
 * @param connection 每个 models 配置的默认 connection
 * @returns {{}}
 */
function getModelDefs(connection) {
  console.log('Loading app models...');
  let models = {};
  let sourceFolder = process.cwd() + '/api/models';
  let files = fs.readdirSync(sourceFolder);
  for (let i = 0; i < files.length; i++) {
    try {
      if (files[i].includes('.js')) {
        let model = require('../api/models/' + files[i]);
        let identity = files[i].toLowerCase().replace('.js', '');
        console.log('found model', identity);
        model.identity = identity;
        model.connection = connection;
        models[identity] = model;
      }
    } catch (err) {
      console.log('extend model err', err.stack || err);
    }
  }
  return models
}
