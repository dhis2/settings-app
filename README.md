# DHIS2 Settings App

[![Build Status](https://travis-ci.com/dhis2/settings-app.svg?branch=master)](https://travis-ci.com/dhis2/settings-app)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fdhis2%2Fsettings-app.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fdhis2%2Fsettings-app?ref=badge_shield)

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


## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fdhis2%2Fsettings-app.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fdhis2%2Fsettings-app?ref=badge_large) [![Greenkeeper badge](https://badges.greenkeeper.io/dhis2/settings-app.svg)](https://greenkeeper.io/)
