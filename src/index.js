const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const customers = [];

function verifyExistsAccountUserName(req, res, next) {
  const { username } = req.headers;
  const customer = customers.find((custome) => custome.userName === username);

  if (!customer) {
    return res.status(404).json({ error: "customer not found" });
  }

  req.customer = customer;

  return next();
}

app.post("/users", (req, res) => {
  const { name, userName } = req.body;

  const custumerAlreadyExists = customers.some(
    (customer) => customer.userName === userName
  );

  if (custumerAlreadyExists) {
    return res.status(400).json({ error: "Customer already exists!" });
  }

  customers.push({
    name,
    userName,
    id: uuidv4(),
    todos: [],
  });

  return res.status(201).send();
});

app.use(verifyExistsAccountUserName);

app.get("/todos", (req, res) => {
  const { customer } = req;
  return res.json(customer.todos);
});

app.post("/todos", (req, res) => {
  const { title, deadline } = req.body;

  const { customer } = req;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  customer.todos.push(todo);
  return res.status(201).send();
});

app.put("/todos/:id", (req, res) => {
  const { title, deadline } = req.body;
  const { id } = req.params;

  const { customer } = req;

  const custom = customer.todos.map((todo) => {
    if (todo.id === id) {
      return {
        ...todo,
        title,
        deadline: new Date(deadline + " 00:00"),
      };
    } else {
      return res.status(404).json({ error: "Todo not exist!" });
    }
  });

  customer.todos = custom;

  return res.status(201).send();
});

app.patch("/todos/:id/done", (req, res) => {
  const { done } = req.body;
  const { id } = req.params;

  const { customer } = req;

  const custom = customer.todos.map((todo) => {
    if (todo.id === id) {
      return {
        ...todo,
        done,
      };
    } else {
      return res.status(404).json({ error: "Todo not exist!" });
    }
  });

  customer.todos = custom;

  return res.status(200).send();
});

app.delete("/todos/:id", (req, res) => {
  const { customer } = req;
  const { id } = req.params;
  const custom = customer.todos.filter((item) => item.id !== id);

  if (custom.leght === customer.todos.leght) {
    return res.status(404).json({ error: "Todo not exist!" });
  }
  customer.todos = custom;

  return res.status(204).json(customer);
});

module.exports = app;
