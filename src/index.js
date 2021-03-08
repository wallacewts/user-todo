const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(userInterator => userInterator.username === username);

  if (!user) {
    return response.status(400).json({error: 'User does not exists.'});
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const userAlreadyExists = users.some(userIterator => userIterator.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({error: 'User already exists.'});
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user, body: { title, deadline } } = request;
  const todo = {
    id: uuidv4(),
    title,
    deadline,
    done: false,
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { 
    user, 
    body: { title, deadline }, 
    params: { id } 
  } = request;
  const todo = user.todos.find(todoInterator => todoInterator.id === id);

  if (!todo) {
    return response.status(404).json({error: 'Todo does not exists.'});
  }

  todo.title = title;
  todo.deadline = deadline;

  return response.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user, params: { id } } = request;
  const todo = user.todos.find(todoInterator => todoInterator.id === id);

  if (!todo) {
    return response.status(404).json({error: 'Todo does not exists.'});
  }

  todo.done = true;

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user, params: { id }} = request;
  const todo = user.todos.find(todoInterator => todoInterator.id === id);

  if (!todo) {
    return response.status(404).json({error: 'Todo does not exists.'});
  }

  user.todos.splice(todo, 1);

  return response.status(204).send();
});

module.exports = app;