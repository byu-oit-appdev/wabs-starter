/**
 *  @license
 *    Copyright 2017 Brigham Young University
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 **/
'use strict';

const router = require('express').Router();
const request = require('byu-wso2-request').request;
const debug = require('debug')('api');
const _ = require('lodash');

module.exports = router;

const requestURL = (url, wabs) => request({
  url,
  method: 'GET',
  json: true,
  resolveWithFullResponse: true,
  simple: true,
  encoding: 'utf8',
  headers: {
    Accept: 'application/json'
  },
  wabs
});

const handleError = (err, res) => {
  debug('Error in service calls!');
  debug(err);
  debug(err.stack);
  res.status(500).json({message: 'Error in upstream service calls!', details: err})
};

const transformResults = (keys, values, transformers, res) => {
  try {
    const result = keys.reduce((prev, key, i) => {
      const o = {};
      o[key] = transformers[i](values[i]);
      return Object.assign({}, prev, o)
    }, {});
    debug('result: ');
    debug(result);
    res.json(result)
  } catch (err) {
    handleError(err, res)
  }
};

router.get('/', function (req, res) {
  debug('request', req.wabs);

    // Subscribe to REST Echo service:
    // https://api.byu.edu/store/apis/info?name=Persons&version=v1&provider=BYU%2Fjohnrb2
  if (!_.has(req, 'wabs.user.byuId')) {
    return res.status(404).json({message: 'Not logged in'})
  }
  const byuId = req.wabs.user.byuId;
  const contact = requestURL(`https://api.byu.edu:443/byuapi/persons/v1/${byuId}?field_sets=basic&contexts=all`, req.wabs)
  const transformContact = (response) => {
    const basic = response.body.basic;
    const email = basic.personal_email_address.value;
    const name = basic.preferred_name.value;
    return { name, email }
  };

  const keys = ['contact'];
  const promises = [contact];
  const transformers = [transformContact];

  Promise.all(promises).then(values => transformResults(keys, values, transformers, res)).catch(handleError, res)
});
