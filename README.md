# Scalio Frame
API/User System Framework

This project provides two major frameworks.  The first is a generalized API that dynamically creates CRUD endpoints
(along with swagger docs) based on schema models, along with a list of other functionality.  The second is a built in user system that includes login/registration support,
roles, groups, and permissions.

## Generalized API
Functionality provided by the generalized API includes:

* Automatic generation of CRUD endpoints with middleware support
* Automatic generation of association endpoints
* Joi validation
* Token authentication for all generated endpoints
* Swagger docs for all generated endpoints
* Automatic detailed logs of all endpoint activity as both console output and persisted data
* Query parameter support for sorting, filtering, pagination, and embedding of associated models
* Built in support for activity feeds and notifications
* Soft delete option for retaining data (in progress)


## User System
Functionality provided by the User System includes:

* Registration support through temporary email links
* Password encryption and token authentication
* user/me endpoint
* Update password endpoint
* Roles
* Groups
* Permissions

The following describes the flow of the user permissions hierarchy:

Individual permissions can be assigned to Users, Groups, and Roles.  Each instance of an assigned permission comes with an "enabled" flag. 
This allows for the rejection of permissions that exist lower in the hierarchy, and results in quick and flexible customization of user permissions.

Each user is assigned to a single role (ex: Account, Admin, Super Admin).  Roles exist to provide a baseline of permissions for each user. 
 
Groups exist to provide an easy way to assign multiple permissions to a common set of users.  For example, Sales, Support, and Managers should 
all be users with an Admin role, however each group will require different sets of permissions.  Assigning groups to a user will customize/extend
the permissions set by their role.  While a user can only have one role, the same user can be assigned to multiple groups.  Permissions assigned to a user
through a group will override conflicting permissions assigned to the user through their role.

Finally, individual permissions can be assigned directly to a user.  These permissions take top priority and override permissions assigned to a user
through their groups and role.  

So the hierarchy goes user permissions -> group permissions -> role permissions.

Here's an example:

Suppose we have the following user:

{
    email: 'test@user.com',
    


# Running for Development
## Running Locally
These instructions can be used to run the API on your local machine.

### Running the Service Locally
```
gulp serve:local
```
**NOTE: this action will create the database tables if they do not already exist, but it will not run migrations or seeds.**

### Setting up the Database Locally
Running the API locally requires an installed MySQL instance. These instructions should help you install an instance so that it matches up with the defined local configuration files.

#### MySQL Installation
Follow the instructions [here](http://blog.joefallon.net/2013/10/install-mysql-on-mac-osx-using-homebrew/) to install MySQL on your local machine.

#### Start the local MySql server
```bash
sudo /usr/local/mysql/support-files/mysql.server start
```

OR
```bash
mysql.server start
```

#### Configuration
Open the MySql console:
```bash
mysql -u root
```

Create the local user and grant privileges:
```
CREATE USER 'dev'@'localhost' IDENTIFIED BY 'dev';

GRANT ALL PRIVILEGES ON *.* TO 'dev'@'localhost' WITH GRANT OPTION;
```

Create the local database:
```
create scalio_frame
```

Your database should now be accessible, though there are still no tables or data in it. The app will create the tables automagically when it first runs and successfully connects to the database.

#### Migrations

Migrations are required when database changes can't be handled automatically by the Sequelize framework.

*NOTE: You must run the app first to ensure necessary tables are created before migrating or seeding*

##### To migrate an existing database:
```
sequelize db:migrate --env=local
```

##### Undo previous migration:
```
sequelize db:migrate:undo --env=local
```

##### Create new migration file:
*TODO: Include a name*
```
sequelize migration:create
```

#### Seeds

##### Seed the database:
```
sequelize db:seed --env=local

OR (in some versions of sequelize)

sequelize db:seed:all --env=local
```
##### Undo previous seed file:
```
sequelize db:seed:undo --env=local
```
##### Create new seed file:
```
sequelize seed:create --env=local
```

## Github
```
git clone git@github.com:scalio/scalio-frame.git
```
Move into the newly created directory
```
cd scalio_frame/
```

## Amazon ECS Deployment
###Build and push new image
Use terraform

###Done?

## Install local dependencies (NPM)

from the app root, run:
```
npm install
```
cd to api/ and run it again:
```
cd api/
```
```
npm install
```


Populate the database, run:
```
gulp serve:development
```
after gulp finishes close with CTRL-C,
now run:
```
sequelize db:seed --env=development
```
Database should now be populated.


## Notes and Troubleshooting

### Migration and Seed Instructions
-After creating a new migration or seed file, replace the "unnammed" portion of the
filename with a description of the file.

-Migrations and seeds are executed in alphabetical order, so make sure to leave the
creation date in the filename.

-After creating a migration or seed file, make sure both "up" and "down" function correctly
with no errors by running seed/migrate and seed:undo/migrate:undo.  If there are errors, manually
revert any changes that took place before the error occurred (NOTE: this is much easier if each
change is logged to the console), then fix the error and try again.

-Try to keep files small and granular to ease debugging.

-Keep in mind that migrations may invalidate previous seed files.


## General Structure

### Major Points of Interest
utilities/rest-helper-factory.js
utilities/joi-mongoose-helper.js
utilities/handler-helper-factory.js
models/
sequelize/migrate
sequelize/seed

## Deployments

### RDS
To Connect to the Database using the guide
[here](http://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ConnectToInstance.html):

DEV:

- **Connection Method:** Standard (TCP/IP)
- **Hostname:** romarkdbinstance-dev.cvyktncx44qd.us-west-2.rds.amazonaws.com
- **Port:** 3306
- **Username:** ask Micah/Zach
- **Password:** ask Micah/Zach


### SSH
To connect to EC2:

DEV:
```
ssh -i ~/.ssh/TempoDevKey.pem ubuntu@54.191.80.133
```

PROD:
```
```


### Forever

This project uses forever to keep the node server running on a background thread. Make sure to kill the current running server (usually PID == 0) before starting another.

list running processes:

```
forever list
```
kill process:

```
forever stop {PID}
```
start node process:


DEV:
```
forever start node_modules/gulp/bin/gulp.js serve:production
```