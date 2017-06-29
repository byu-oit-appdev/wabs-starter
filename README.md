# WABS Starter

This is a terminal application that assists in the defining and creating of full stack single page web applications ([SPA](./starter/README.md)) that uses [WABS](https://github.com/byu-oit/wabs-middleware). The application can:

- Build a new [SPA](./starter/README.md) from a template.

- Manage the WSO2 credentials for [SPAs](./starter/README.md) defined on the machine.

- Test WSO2 credentials.

## Installation

```sh
npm install -g byu-oit/wabs-starter
```

## Defining WSO2 Credentials

If your [SPA](./starter/README.md) will not use WSO2 you can skip to the [Build](#build) section.

WSO2 requires a consumer key and consumer secret (also known as a client id and client secret respectively). The [WABS middleware](https://github.com/byu-oit/wabs-middleware) will attempt to read this information from multiple locations automatically, in this order: 

1. From [command line arguments](#) that are used to start the server.
 
2. From [environment variables](#).

3. From [the file](#) located at `$HOME/.wabs/config.json`.

4. From [the AWS parameter store](#).

### Command Line Arguments

After you've [built an SPA from the starter](#build) you can run your application using this command to specify the consumer key, consumer secret, and encrypt secret via command line arguments:

```sh 
node serve -c <consumer-key> -s <consumer-secret> -e <encrypt secret>
```

### Environment Variables




Using the starter is a three step process.

1. Build the [SPA](./starter/README.md) from the starter template. This is easily done using the [terminal application](#terminal-application).

2. Navigate to the [SPA](./starter/README.md) directory.

3. Run the command: `npm start`

### Terminal Application

To start the terminal application, open a terminal and type the following command: `wabs`.

![App Screenshot](./terminal.png)

- The keyboard can be used to navigate the terminal application. See the keyboard help at the bottom. 

- The terminal application may support mouse usage, depending on what terminal you are using.

- The left side has a list of all full-stack apps currently defined on the machine.

- Top left is a button to define a new full-stack app.

- The middle column is the full-stack app menu. Select an item to see details and list of controls in the right column.

## Alternate Usage

The above [usage](#usage) is the recommended usage, but if you'd like to do things by hand it's pretty straight forward too.

### Managing SPA Credentials

Credentials are stored in a file located in your home directory under `.wabs/config.json`. If you want to manually manage the credentials file then you need to modify this file. If you have not used the `wabs` command and saved an app then this file will not exist yet but it can be created either manually or through the `wabs` terminal application.

The credentials file is structured like this:

```json
{
  "my-first-app": {
    "consumerKey": "asdf1234",
    "consumerSecret": "hjkl7890",
    "encryptSecret": "a2*r5jLDOx0"
  }
}
```

### Building a Full Stack SPA

1. Download or clone the repository at [https://github.com/byu-oit/wabs-starter](https://github.com/byu-oit/wabs-starter)

2. Delete everything except the `starter` directory.

3. Do a find and replace for each of the following for the entire `starter` directory.

    - Replace `{{name}}` with the name of your app as defined in the `$HOME/.wabs/config.json` file.
    
4. Rename the `starter` directory to whatever you want.