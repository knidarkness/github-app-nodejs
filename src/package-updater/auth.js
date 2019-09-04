import { App } from '@octokit/app';
import Octokit from '@octokit/rest';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

// Initialize GitHub App with id:private_key pair and generate JWT which is used for
// application level authorization
const app = new App({ id: process.env.GITHUB_APP_IDENTIFIER, privateKey: process.env.PRIVATE_KEY });
const jwt = app.getSignedJsonWebToken();

const getInstallationAccessTokenByInstallationId = async (installationId) => {
  const installationAccessToken = await app.getInstallationAccessToken({
    installationId,
  });
  return installationAccessToken;
};

/**
 * This method will generate an installationAccessToken which we will further pass to create
 * installation level client for GitHub API.
 *
 * @param {string} owner A name of github account, repository with installation
 * belongs to. E.g. 'knidarkness'
 * @param {string} repo A name of a repository with GitHub App installed. E.g. 'github-app-nodejs'
 */
const getInstallationAccessToken = async (owner, repo) => {
  // Firstly, get the id of the installation based on the repository
  const result = await fetch(`https://api.github.com/repos/${owner}/${repo}/installation`,
    {
      headers: {
        authorization: `Bearer ${jwt}`,
        accept: 'application/vnd.github.machine-man-preview+json',
      },
    });

  const installationId = (await result.json()).id;

  // And acquire access token for that id
  const installationAccessToken = await getInstallationAccessTokenByInstallationId(installationId);

  return installationAccessToken;
};

const getInstallations = async () => {
  const result = await fetch('https://api.github.com/app/installations',
    {
      headers: {
        authorization: `Bearer ${jwt}`,
        accept: 'application/vnd.github.machine-man-preview+json',
      },
    });
  const jsonResponse = await result.json();
  return jsonResponse;
};

const getInstallationClient = async (owner, repo) => {
  const installationAccessToken = await getInstallationAccessToken(owner, repo);
  return new Octokit({
    auth() {
      return `token ${installationAccessToken}`;
    },
  });
};

const getInstallationClientByInstallationId = async (installationId) => {
  const installationAccessToken = await getInstallationAccessTokenByInstallationId(installationId);
  return new Octokit({
    auth() {
      return `token ${installationAccessToken}`;
    },
  });
};

export {
  getInstallationClient,
  getInstallations,
  getInstallationClientByInstallationId,
};
