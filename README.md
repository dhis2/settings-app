# DHIS2 Settings App

[![Greenkeeper badge](https://badges.greenkeeper.io/dhis2/settings-app.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/dhis2/settings-app.svg?branch=master)](https://travis-ci.org/dhis2/settings-app)

### Pre-requisites
Since the app uses webpack as a build tool you will need to install this first.
```sh
npm i -g webpack webpack-dev-server
```

### Running the dev server
The following command will start the development server which uses CORS to communicate with a DHIS2 instance. 
```sh
webpack-dev-server
# or
npm start
```
For this to properly work you will need to add a `dev_manifest.webapp` to the root of your application. The following snippet shows an example of such a manifest. In addition to that you need to add `http://localhost:8081` url to your DHIS2 CORS whitelist. (This can be done in the settings app)
```json
{
  "activities": {
    "dhis": {
      "href": "http://localhost:8080/dhis"
    }
  }
}
```

### Building the project
To build a production version of the application run the following command.
```sh
npm run build
```
