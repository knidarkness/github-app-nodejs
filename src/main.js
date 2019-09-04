import updateRemoteRepository from './package-updater';

const repo = 'knidarkness/test-repo';
const packageName = 'express';
const newVersion = '6.1.0';

updateRemoteRepository(repo, packageName, newVersion)
  .then((obj) => console.log(obj));
