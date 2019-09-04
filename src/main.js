import express from 'express';
import updateRemoteRepository from './package-updater';

const app = express();

app.use(express.json());

app.post('/', (req, res) => {
  console.log(req.body);
  res.json({
    status: 200,
  });
});

app.listen(3000);

// const repo = 'knidarkness/test-repo';
// const packageName = 'express';
// const newVersion = '6.1.0';

// updateRemoteRepository(repo, packageName, newVersion)
//   .then((obj) => console.log(obj));
