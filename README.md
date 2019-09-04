# Package-updater

## Rationale
This package's intent is to automatically create pull requests after a version of given lib is updated. Each PR will be created in a repo which depends on the package which have updated and will suggest to merge a modified package.json file.

## Installation

To run this app you should follow such steps:
1. Clone this repository via `git clone git@github.com:knidarkness/package-updater.git` 
2. Install packages by `npm install`
3. Create .env file with following contents:
```
PRIVATE_KEY="-----BEGIN RSA PRIVATE\n... your private key for GithubApp goes here"
GITHUB_APP_IDENTIFIER=your app id
GITHUB_WEBHOOK_SECRET=your webhook secret
```
4. Or ask @knidarkness to provide you with credentials for internal usage.


## License

This utility script is distributed under the Apache 2.0 License
