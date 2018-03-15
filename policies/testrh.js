var testrh = function(request, reply, next) {
  request.logger.debug("HERE REST HAPI");
  return next(null, true); // All is well with this request.  Proceed to the next policy or the route handler.
};

// This is optional.  It will default to 'onPreHandler' unless you use a different defaultApplyPoint.
testrh.applyPoint = 'onPreHandler';

module.exports = testrh;