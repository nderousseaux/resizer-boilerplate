/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

const isLoggedIn = require("../api/policies/isLoggedIn");


module.exports.policies = {
  UserController:{
    '*':true
  },

  '*': 'isLoggedIn',
};
