const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

require('dotenv').config(); 

const testMail = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;

// signup : receive email and password, hash the password and save the user on the DB
exports.signup = (req, res, next) => {
  //check the email
  if (testMail.test(req.body.email)){
    //check the password
    if (9 <= req.body.password.length <= 20){
      bcrypt.hash(req.body.password, 10)
      .then(hash => {
        //Create the new user
        const user = new User({
          email: req.body.email,
          password: hash
        });
        // save the new user
        user.save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json(error ));
    }
    else{
      return res.status(500).json ({message: 'Le mot de passe doit contenir entre 9 et 20 caractères.'});
    }
  }
  else{
    return res.status(500).json ({message: 'Le mail doit correspondre aux normes.'});
  }
};

// login : find the user with the email, give him a access for 24h
exports.login = (req, res, next) => {
  //find the user
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }
      //check the password
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }
          // give access for 24h
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              `${process.env.ACCESS_TOKEN_SECRET}`,
              { expiresIn: '24h' }
            )
          });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};