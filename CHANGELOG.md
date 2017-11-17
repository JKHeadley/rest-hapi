# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]


## [0.37.0] - 2017-11-17
### Added
- [Duplicate fields](https://github.com/JKHeadley/rest-hapi#duplicate-fields) feature.
- Add [regex validator](https://github.com/JKHeadley/rest-hapi#route-validation).

### Fixed
- Moved testHelper to utilities directory to be included in npm module.
- Moved query-string to regular dependencies for testHelper.
- Updated travis since it broke for no apparent reason.
- Fixed bug preventing associations added from wrapper methods to update correctly.

## [0.36.0] - 2017-11-11
### Added
- Exposed testHelper to RestHapi object, mostly for server injection utilities.

### Fixed
- Fixed bug preventing \_id filtering for getAll queries with real ObjectIds.

## [0.35.0] - 2017-11-10
### Added
- Updated joi model for object types.

### Fixed
- Fixed bug preventing object types.

## [0.34.0] - 2017-11-05
### Added
- Added error response for db conflicts.

### Fixed
- Auditlog validation warning.
- Fix payload copies to work with ObjectIds.
- Added missing permissions.
- Added missing params to mongoose wrappers.

## [0.33.0] - 2017-10-23
### Added
- Endpoint activity history tracking via [Audit Logs](https://github.com/JKHeadley/rest-hapi#audit-logs)

## [0.32.0] - 2017-10-23 [BREAKING]
### Changed
- [BREAKING] Modified update: pre middleware to include payload copy.  This is more consistent and allows the original payload to remain unchanged. 
  * The table below shows the middleware functions before (v0.31.1) and after (v0.32.0)

Before | After
--- | --- 
**update** 
pre(\_id, request, Log) | pre(\_id, payload, request, Log)

## [0.31.0] - 2017-10-19
### Added
- Added end to end unit tests.

### Changed
- Updated list and find to return original "\_id"s instead of strings.
- Swapped to js Promise rather than Q promise for mongoose.

### Fixed
- Fixed bug preventing "$where" association queries.
- Added a 'select' call to association endpoints to allow owner object to be updated during association middleware.
- Fixed bug with linking model modelName.
- Added missing return statement to removeAssociation. Was causing promises to return before mongo entries updated.

## [0.30.0] - 2017-10-12
### Added
- Added "add" [association middleware](https://github.com/JKHeadley/rest-hapi#association) for "addOne" and "addMany" endpoints."

## [0.29.0] - 2017-10-10
### Added
- Support for policies via [mrhorse](https://github.com/mark-bradshaw/mrhorse) plugin.
- Support for [document-level authorization](https://github.com/JKHeadley/rest-hapi#document-authorization)
- Built in policies for [authorizing document creators](https://github.com/JKHeadley/rest-hapi#document-authorization)
- `createdBy`, `updatedBy`, and `deletedBy` [metadata options](https://github.com/JKHeadley/rest-hapi#user-tags).

### Changed
- Deprecated `routeOptions.scope` and `routeOptions.scope.scope` and replaced with `routeOptions.routeScope` and `routeOptions.routeScope.rootScope`.

## [0.28.0] - 2017-09-29
### Added
- Added `update-associations` [cli tool](https://github.com/JKHeadley/rest-hapi#updating-many_many-db-data).

### Fixed
- Updated hapi-swagger to fix circular reference issue.

## [0.27.0] - 2017-09-28 [BREAKING]
### Added
- Added option (`config.embedAssociations`) to use linking model collections.
 * See [docs](https://github.com/JKHeadley/rest-hapi#many_many-data-storage) for details.

### Changed
- [BREAKING] `config.embedAssociations` set to `false` by default to take advantage of mongoose virtuals.  If you already have documents in your db, set this option to `true` to continue with the same functionality.
 * If possible, future versions will include a cli command to convert existing db data between MANY_MANY structures.

## [0.26.0] - 2017-09-24
### Added
- Added config option to disable 500 response for response validation (disabled by default).

### Changed
- Cleaned up tests
- Major updates to joi helper functions including support for nested fields.

## [0.25.0] - 2017-09-20
### Added
- Added config option to enable logging of routes and scopes (disabled by default).

## [0.24.0] - 2017-09-19

### Added
- Exposed [joi helper methods](https://github.com/JKHeadley/rest-hapi#joi-helper-methods), including the rest-hapi version of Joi ObjectId.
### Fixed
- Throw error when payload is empty for addMany.

## [0.23.0] - 2017-09-12
### Added
- Allow custom errors in middleware

### Changed
- Cleaned up tests
- Removed requirement that middlware functions return a promise.

## [0.22.0] - 2017-09-08
### Added
- getAll association middleware
- Uncommented and updated deleteOne handler tests.

### Changed
- Replaced Boom.serverTimeout with .badImplementation

## [0.21.0] - 2017-09-06
### Added
- list and find pre middleware
- Uncommented and updated create and update handler tests.

## [0.20.3] - 2017-09-01
### Changed
- Fixed bug that missed when a payload is an array of Ids.

## [0.20.2] - 2017-08-31
### Added
- Uncommented and updated find handler tests.

### Changed
- Update dependencies and tests so that rest-hapi works under node v8.

## [0.20.0] - 2017-08-29 [BREAKING]
### Added
- Hapi request object now accessible in middleware functions.

### Changed
- [BREAKING] Middleware function parameters have changed to support the ``request`` object. 
  * The table below shows the middleware functions before (v0.19.2) and after (v0.20.0)

Before | After
--- | --- 
**list**    
post(query, result, Log) |      post(request, result, Log)  
--- | --- 
**find**   
post(query, result, Log)    |      post(request, result, Log)  
--- | --- 
**create** 
pre(payload, Log) | pre(payload, request, Log)
post(document, result, Log) | post(document, request, result, Log)
--- | --- 
**update** 
pre(\_id, payload, Log) | pre(\_id, request, Log)
post(payload, result, Log) | post(request, result, Log)
--- | --- 
**delete** 
pre(\_id, hardDelete, Log) | pre(\_id, hardDelete, request, Log)
post(hardDelete, deleted, Log) | post(hardDelete, deleted, request, Log)



[Unreleased]: https://github.com/jkheadley/rest-hapi/compare/v0.37.0...HEAD
[0.20.0]: https://github.com/jkheadley/rest-hapi/compare/v0.19.2...v0.20.0
[0.20.2]: https://github.com/jkheadley/rest-hapi/compare/v0.20.0...v0.20.2
[0.20.3]: https://github.com/jkheadley/rest-hapi/compare/v0.20.2...v0.20.3
[0.21.0]: https://github.com/jkheadley/rest-hapi/compare/v0.20.3...v0.21.0
[0.22.0]: https://github.com/jkheadley/rest-hapi/compare/v0.21.0...v0.22.0
[0.23.0]: https://github.com/jkheadley/rest-hapi/compare/v0.22.0...v0.23.0
[0.24.0]: https://github.com/jkheadley/rest-hapi/compare/v0.23.0...v0.24.0
[0.25.0]: https://github.com/jkheadley/rest-hapi/compare/v0.24.0...v0.25.0
[0.26.0]: https://github.com/jkheadley/rest-hapi/compare/v0.25.0...v0.26.0
[0.27.0]: https://github.com/jkheadley/rest-hapi/compare/v0.26.0...v0.27.0
[0.28.0]: https://github.com/jkheadley/rest-hapi/compare/v0.27.0...v0.28.0
[0.29.0]: https://github.com/jkheadley/rest-hapi/compare/v0.28.0...v0.29.0
[0.30.0]: https://github.com/jkheadley/rest-hapi/compare/v0.29.0...v0.30.0
[0.31.0]: https://github.com/jkheadley/rest-hapi/compare/v0.30.0...v0.31.0
[0.32.0]: https://github.com/jkheadley/rest-hapi/compare/v0.31.0...v0.32.0
[0.33.0]: https://github.com/jkheadley/rest-hapi/compare/v0.32.0...v0.33.0
[0.34.0]: https://github.com/jkheadley/rest-hapi/compare/v0.33.0...v0.34.0
[0.35.0]: https://github.com/jkheadley/rest-hapi/compare/v0.34.0...v0.35.0
[0.36.0]: https://github.com/jkheadley/rest-hapi/compare/v0.35.0...v0.36.0
[0.37.0]: https://github.com/jkheadley/rest-hapi/compare/v0.36.0...v0.37.0

[BREAKING]: https://github.com/JKHeadley/rest-hapi/releases
