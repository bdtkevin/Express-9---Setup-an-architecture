const usersRouter = require('express').Router();
const User = require('../models/user');

usersRouter.get('/', (req, res) => {
  const { language } = req.query;
  User.findMany({ filters: { language } })
    .then((users) => {
      res.json(users);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Error retrieving users from database');
    });
});

usersRouter.get('/:id', (req, res) => {
  User.findOne(req.params.id)
    .then((user) => {
      if (user) res.json(user);
      else res.status(404).send('User not found');
    })
    .catch((err) => {
      res.status(500).send('Error retrieving user from database');
    });
});

usersRouter.post('/', (req, res) => {
  const error = User.validate(req.body);
  if (error) {
    res.status(422).json({ validationErrors: error.details });
  } else {
    User.create(req.body)
      .then((createdUser) => {
        res.status(201).json(createdUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error saving the user');
      });
  }
});

usersRouter.put('/:id', (req, res) => {
  let existingUser = null;
  let validationErrors = null;
  User.findOne(req.params.id)
    .then((user) => {
      existingUser = user;
      if (!existingUser) return Promise.reject('RECORD_NOT_FOUND');
      validationErrors = User.validate(req.body, false);
      if (validationErrors) return Promise.reject('INVALID_DATA');
      return User.update(req.params.id, req.body);
    })
    .then(() => {
      res.status(200).json({ ...existingUser, ...req.body });
    })
    .catch((err) => {
      console.error(err);
      if (err === 'RECORD_NOT_FOUND')
        res.status(404).send(`User with id ${req.params.id} not found.`);
      else if (err === 'INVALID_DATA')
        res.status(422).json({ validationErrors: validationErrors.details });
      else res.status(500).send('Error updating a user.');
    });
});

usersRouter.delete('/:id', (req, res) => {
  User.destroy(req.params.id)
    .then((deleted) => {
      if (deleted) res.status(200).send('🎉 User deleted!');
      else res.status(404).send('User not found');
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Error deleting a user');
    });
});

module.exports = usersRouter;
