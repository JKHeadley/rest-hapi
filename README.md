# Tempo
Inventory Management System

# Running for Development
## Running Locally (No Container)
These instructions can be used to run the API on your local machine (outside of a container).

### Running the Service Locally (No Container)
```
gulp serve:dev-local
```
**NOTE: this action will create the database tables if they do not already exist, but it will not run migrations or seeds.**

### Setting up the Database Locally (No Container)
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
create tempo_dev
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


## Running Locally (In a Docker Container)
### Running the App Locally (In a Docker Container)
#### Build the Docker Container:
This compiles the api code and creates a container as well
*NOTE: Don't forget the '.' at the end of the command*
```
docker build -t "tempo-api" .
```
### Setting Up the Database Locally (In a Docker Container)
#### Run Mysql (In a Docker Container):
built based on: https://hub.docker.com/_/mysql/

```bash
docker run --name tempo-dev-mysql -p 3306:3306 -e MYSQL_DATABASE=tempo_dev -e MYSQL_ROOT_PASSWORD=dev -e MYSQL_USER=dev -e MYSQL_PASSWORD=dev -d mysql:5.7
```

#### Stop Mysql Docker Container
```bash
docker stop tempo-dev-mysql
```

#### Clear Mysql Docker Container
```bash
docker rm tempo-dev-mysql
```

Some Explanations:
`--name tempo-dev-mysql` - names the image
`-p 3306:3306` - maps the container's mysql port '3306' to the host's (aka "your dev box's") '3306' port
`-e MYSQL_DATABASE=tempo_dev -e MYSQL_ROOT_PASSWORD=dev -e MYSQL_USER=dev -e MYSQL_PASSWORD=dev` - sets those environment variables in the container. These values are used by the pre-built `mysql:5.7` image to customize the setup.
`-d` - runs the image in the background
`mysql:5.7` - The base image used (this is what's doing most of the work)

#### Migrations

Migrations are required when database changes can't be handled automatically by the Sequelize framework.

*NOTE: You must run the app first to ensure necessary tables are created before migrating or seeding*

##### To migrate an existing database:
```
sequelize db:migrate
```

##### Undo previous migration:
```
sequelize db:migrate:undo
```

##### Create new migration file:
*TODO: Include a name*
```
sequelize migration:create
```

#### Seeds

##### Seed the database:
```
sequelize db:seed

OR (in some versions of sequelize)

sequelize db:seed:all
```
##### Undo previous seed file:
```
sequelize db:seed:undo
```
##### Create new seed file:
```
sequelize seed:create
```


#### Run the App Locally (In a Docker Container):
*NOTE: this assumes the container has been built as specified above. Remember that you'll need to rebuild the container to pick up code changes*

##### Run
```bash
docker run --name tempo-api-dev -p 49160:8124 --link tempo-dev-mysql:mysql -d -e ENVIRONMENT=development tempo-api
```

##### Stop
```bash
docker stop tempo-api-dev
```

##### Clear
```bash
docker rm tempo-api-dev
```

##### Stop, Clear, Run (For your convenience)
```bash
docker stop tempo-api-dev; docker rm tempo-api-dev; docker run --name tempo-api-dev -p 49160:8124 --link tempo-dev-mysql:mysql -d -e ENVIRONMENT=development tempo-api
```


## Github
```
git clone git@github.com:scalio/tempo-api.git
```
Move into the newly created directory
```
cd tempo-api/
```

## Amazon ECS Deployment
###Build and push new image
 Follow instructions here:
https://us-west-2.console.aws.amazon.com/ecs/home?region=us-west-2#/repositories/tempo-api#images

*if the connection to docker login command fails, try restarting the docker machine with `docker-machine stop; docker-machine start`

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
gulp serve:dev-local
```
after gulp finishes close with CTRL-C,
now run:
```
sequelize db:seed
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

### Docker
I was getting `Cannot connect to the Docker daemon. Is the docker daemon running on this host?`

Top answer on this post helped: http://stackoverflow.com/questions/21871479/docker-cant-connect-to-docker-daemon

`docker-machine start default; docker-machine regenerate-certs default; eval "$(docker-machine env default)"`



## General Structure

### Major Points of Interest
utilities/rest-helper-factory.js
utilities/joi-sequelize-helper.js
utilities/handler-helper-factory.js
models/
sequelize/migrate
sequelize/seed

## Deployments

### Heroku (deprecated)

1. NOTE: This project is hosted on Heroku. Make sure you have the Heroku Toolbelt installed or get it from [here](https://toolbelt.heroku.com/).

1.  If you haven't already, log in to your Heroku account and follow the prompts to create a new SSH public key:
```heroku login```.

1. Add the Heroku remote branch to your local machine:
```heroku git:remote -a tempo-api```

1. After updating the git repo with the latest changes, deploy to Heroku:
```git push heroku develop:master```



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
