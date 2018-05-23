const User = require("../models").User;
const jwt = require("jwt-simple");
const config = require("../config");

function tokenizer(user) {
  const timestamp = new Date().getTime();
  return jwt.encode(
    {
      sub: user.id,
      iat: timestamp
    },
    config.secret
  );
}

exports.signup = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(422).send({ error: "You must provide an email and password" });
  }

  User.findOne({ email })
    .then(dbuser => {
      // if the user exists return an error
      if (dbuser) {
        return res.status(422).send({ error: "Email already in use" });
      }
      //create new user object
      const user = new User({ email: email, password: password });
      // save the user
      user.save().then(user => {
        console.log(user);
        // respond with the success if the user existed
        res.json({ token: tokenizer(user) });
      });
    })
    .catch(err => {
      return next(err);
    });
};

exports.signin = (req, res, next) => {
  // passport passes in the user mongoose model on the req.user property
  // User has already had their email and password authenticated
  // They just need a token
  res.send({token: tokenizer(req.user)});
};
