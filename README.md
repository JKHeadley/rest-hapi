# Scalio Frame
API/User System Framework

This project provides two major frameworks.  The first is a generalized API that dynamically creates CRUD endpoints
(along with swagger docs) based on sequelize models.  The second is a built in user system that includes login support,
roles, and permissions.

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
utilities/joi-sequelize-helper.js
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
