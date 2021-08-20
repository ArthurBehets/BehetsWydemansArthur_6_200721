const Sauce = require('../models/sauce');
const fs = require('fs');
// getAll : find every Sauce and return it
exports.getAll = (req, res, next) => {
    Sauce.find().then( //get all sauces
      (allSauces) => {
        res.status(200).json(allSauces);
      }
    ).catch(
      (error) => {
        res.status(400).json({
          error: error
        });
      }
    );
};
//getOne : find a sauce with the id and return it
  exports.getOne = (req, res, next) => {
      Sauce.findOne({ //get one sauce with the ID
          _id : req.params.id
      }).then(
          (oneSauce) => {
              res.status(200).json(oneSauce);
          })
    .catch(
        (error) => {
            res.status(400).json({
                error : error
            });
        }
    )
  }

  // create : create a new Sauce and put the req.body.sauce on it
exports.create = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce); //getting the request body
    delete sauceObject._id;
    const newSauce = new Sauce({ //creating the new sauce
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    newSauce.save().then(( //saving the new sauce
        () => {
            res.status(201).json({
                message : "New sauce added"
            })
        }
    ))
    .catch((
        (error) => {
            res.status(400).json({
                error : error
            });
        }
    ))
}

// modify : check if the req have a file. Yes? Modify the file then the rest of the request. No? Just modify the rest of the request
exports.modify = (req, res, next) => {
    const sauceObject = req.file ? //checking if there is a file one the request 
      {
        ...JSON.parse(req.body.sauce), //updating the file if there is one
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
      } : { ...req.body };
    Sauce.updateOne({ _id: req.params.id }, { // updating the sauce
         ...sauceObject, _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Objet modifié !' }))
      .catch(error => res.status(400).json({ error }));
  };

  // delete : find a sauce with the id and delete it and the file.
exports.delete = (req, res, next) => { 
    Sauce.findOne({ _id: req.params.id }) //finding the sauce with the ID
    .then(sauce => {
        const filename = sauce.imageUrl.split('/images/')[1]; 
        fs.unlink(`images/${filename}`, () => { //delete the file
                Sauce.deleteOne({ _id: req.params.id }) //delete the sauce
            .then(() => 
                res.status(200).json({ message: 'Objet supprimé !' }))
            .catch(error => 
                res.status(400).json({ error }));
        });
      })
      .catch(error => res.status(500).json({ error }));
  };

  
  // Like : like, dislike or delete the like/dislike of the sauce
exports.like = (req, res, next) => {
    switch (req.body.like) {
      // delete the like/dislike
      case 0: //cancel the like/dislike
          Sauce.findOne({ _id: req.params.id }) //finding the sauce with the ID
          .then(oldSauce => {
            if (oldSauce.usersLiked.find(userId => userId === req.body.userId)){ //was liked?
              Sauce.updateOne({ _id: oldSauce.id }, { //update to cancel the like
                $inc: { likes: -1 },
                $pull: { usersLiked: req.body.userId },
                _id: req.params.id
              })
                .then(() => { res.status(201).json({ message: 'Total modified' }); })
                .catch((error) => { res.status(400).json({ error: error }); });
            } 
            else if (oldSauce.usersDisliked.find(userId => userId === req.body.userId)){ //was disliked?
              Sauce.updateOne({ _id: oldSauce.id }, { //update to cancel the dislike
                $inc: { dislikes: -1 },
                $pull: { usersDisliked: req.body.userId },
                _id: req.params.id
              })
                .then(() => { res.status(201).json({ message: 'Total modified' }); })
                .catch((error) => { res.status(400).json({ error: error }); });
            } 
          })
          .catch((error) => { res.status(404).json({ error: error }); });
        break;
        // like
      case 1:
        Sauce.findOne({ _id: req.params.id }) //finding the sauce with the ID
          .then(oldSauce => {
            if (oldSauce.usersLiked.indexOf(req.body.userId === -1)){ // wasn't already liked?
              Sauce.updateOne({ _id: oldSauce.id }, { //update to add like
                $inc: { likes: 1 },
                $push: { usersLiked: req.body.userId },
                _id: req.params.id
              })
                .then(() => { res.status(201).json({ message: 'Total modified' }); })
                .catch((error) => { res.status(400).json({ error: error }); });
            }
            else{
              return res.status(500).json({ error: 'Sauce already liked' });
            }
          })
          .catch((error) => { res.status(404).json({ error: error }); });
        break;
        //dislike
      case -1:
          Sauce.findOne({ _id: req.params.id }) //finding the sauce with the ID
          .then(oldSauce => {
            if (oldSauce.usersDisliked.indexOf(req.body.userId === -1)){ //wasn't already disliked?
              Sauce.updateOne({ _id: oldSauce.id }, { //update to add dislike
                $inc: { dislikes: 1 },
                $push: { usersDisliked: req.body.userId },
                _id: req.params.id
              })
                .then(() => { res.status(201).json({ message: 'Total modified' }); })
                .catch((error) => { res.status(400).json({ error: error }); });
            }
            
          })
          .catch((error) => { res.status(404).json({ error: error }); });
        break;
    default:
        console.error('Wrong request');
    }
  };