import dotenv from 'dotenv';

dotenv.config();


export const filterRequiredParams = (req, res, next) => {
  if (!req.body || !req.body.repository || !req.body.ref) {
    res.json({ status: 'not all required params present - ignored' });
  }
  next();
};

export const filterRepositoryName = (req, res, next) => {
  if (req.body.repository.full_name !== process.env.SOURCE_REPO) {
    req.json({ status: 'push not to the source repository - ignored' });
  }
  next();
};

export const filterDestinationBranch = (req, res, next) => {
  if (req.body.ref.split('/')[2] !== req.body.repository.master_branch) {
    res.json({ status: 'push not to master branch - ignored' });
  }
  next();
};
