import getInstallationClient from './auth';

const getRemotePackageJSONObject = async (installationClient, owner, repo) => {
  const fileData = await installationClient.repos.getContents({
    owner,
    repo,
    path: 'package.json',
  });
  const fileObject = JSON.parse(Buffer.from(fileData.data.content, 'base64').toString());
  return fileObject;
};

const updatePackageJSONObject = (packageJSONObject, packageName, newVersion) => ({
  ...packageJSONObject,
  dependencies: {
    ...packageJSONObject.dependencies,
    [packageName]: newVersion,
  },
});

const createRemoteBranch = async (installationClient, repositoryOwner, repositoryName, packageName, newVersion) => {
  // Firstly, we fetch commits to get SHA sum of the last commit, from which we will branch out.
  const commits = await installationClient.repos.listCommits({
    owner: repositoryOwner,
    repo: repositoryName,
  });
  const lastSHA = commits.data[0].sha;
  // Substitute variables to get new branch naem
  const newBranchName = `refs/heads/${packageName}-update-to-${newVersion}`;
  // And call method to create branch on remote repository
  await installationClient.git.createRef({
    owner: repositoryOwner,
    repo: repositoryName,
    ref: newBranchName,
    sha: lastSHA,
  });
  return newBranchName;
};

const commitUpdatedObject = async (installationClient, repositoryOwner, repositoryName, remoteBranchName, updatePackageJSONObject) => {
  // We get a SHA sum of the file in target branch
  const { sha } = (await installationClient.repos.getContents({
    owner: repositoryOwner,
    repo: repositoryName,
    path: 'package.json',
    ref: remoteBranchName,
  })).data;

  // And commit our changes to that branch
  await installationClient.repos.createOrUpdateFile({
    owner: repositoryOwner,
    repo: repositoryName,
    path: 'package.json',
    branch: remoteBranchName,
    message: remoteBranchName,
    sha,
    // Note, that content goes in the base64 encoding which is an update for upstream in GitHub API
    content: Buffer.from(JSON.stringify(updatePackageJSONObject, null, 2)).toString('base64'),
  });
};

const createPR = async (installationClient, owner, repo, newBranchName) => {
  // get the name of a default branch as it is not always a 'master'
  const { default_branch } = (await installationClient.repos.get({ owner, repo })).data;
  // and create PR to merge into it
  installationClient.pulls.create({
    owner,
    repo,
    title: `Merge ${newBranchName} as new version of package available`,
    head: newBranchName,
    base: default_branch,
    maintainer_can_modify: true,
  });
};

const splitRepositoryPath = (repo) => ({
  repositoryOwner: repo.split('/')[0],
  repositoryName: repo.split('/')[1],
});

const updateRemoteRepository = async (repo, packageName, newVersion) => {
  const { repositoryOwner, repositoryName } = splitRepositoryPath(repo);
  const installationClient = await getInstallationClient(repositoryOwner, repositoryName);
  
  const packageJSONObject = await getRemotePackageJSONObject(installationClient, repositoryOwner, repositoryName);
  const updatedPackageJSONObject = updatePackageJSONObject(packageJSONObject, packageName, newVersion);
  const remoteBranchName = await createRemoteBranch(installationClient, repositoryOwner, repositoryName, packageName, newVersion);
  await commitUpdatedObject(installationClient, repositoryOwner, repositoryName, remoteBranchName, updatedPackageJSONObject);
  await createPR(installationClient, repositoryOwner, repositoryName, remoteBranchName);
  return true;
};

export default updateRemoteRepository;
