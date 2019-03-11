# DHIS2 Settings App

[![Build Status](https://travis-ci.com/dhis2/settings-app.svg?branch=master)](https://travis-ci.com/dhis2/settings-app)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fdhis2%2Fsettings-app.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fdhis2%2Fsettings-app?ref=badge_shield)
[![Greenkeeper badge](https://badges.greenkeeper.io/dhis2/settings-app.svg)](https://greenkeeper.io/)

### Running the dev server

The following command will start the development server which communicates with a DHIS2 instance (make sure to run `yarn install` first).

```sh
npm start
```

You will need to add `http://localhost:8081` url to your DHIS2 CORS whitelist (this can be done in the settings app).

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
