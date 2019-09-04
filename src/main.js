import express from 'express';
import dotenv from 'dotenv';
import { updateAllDependents } from './package-updater';

dotenv.config();

const app = express();

app.use(express.json());

app.post('/', async (req, res) => {
  if (!req.body || !req.body.repository || !req.body.ref) {
    res.json({ status: 'not all required params present - ignored' });
    return;
  }
  if (req.body.repository.full_name !== process.env.SOURCE_REPO) {
    req.json({ status: 'push not to the source repository - ignored' });
    return;
  }
  if (req.body.ref.split('/')[2] !== req.body.repository.master_branch) {
    res.json({ status: 'push not to master branch - ignored' });
    return;
  }
  await updateAllDependents();
  res.json({
    status: 200,
  });
});

app.listen(3000);
