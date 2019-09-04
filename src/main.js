import express from 'express';
import { updateAllDependents } from './package-updater';
import { filterRequiredParams, filterRepositoryName, filterDestinationBranch } from './middlewares';

const app = express();

app.use(express.json());

app.use(filterRequiredParams);
app.use(filterRepositoryName);
app.use(filterDestinationBranch);

app.post('/', async (req, res) => {
  await updateAllDependents();
  res.json({
    status: 200,
  });
});

app.listen(3000);
