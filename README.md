# settings-app
DHIS2 Settings App

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

Additionally we also need to provide an Authentication header to the http requests as the dev server uses CORS to communicate with your local instance. For this we will use a file that is only included when the dev environment is run and will be left out when running in production mode. Create a file called `dev-jquery-auth.js` to the root of the project and give this file the following contents.
```js
jQuery.ajaxSetup({
    headers: {
        Authorization: 'Basic ' + btoa('admin:district')
    }
});
```
> Note that when your username and password do not correspond with _admin_ and _district_ you will need to change these in the snippet.

### Building the project
To build a production version of the application run the following command.
```sh
npm run build
```
