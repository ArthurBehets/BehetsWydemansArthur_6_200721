const Sauce = require('../models/sauce');
const fs = require('fs');

exports.getAll = (req, res, next) => {
    Sauce.find().then(
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

  exports.getOne = (req, res, next) => {
      Sauce.findOne({
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
  
exports.create = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const newSauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    newSauce.save().then((
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

exports.modify = (req, res, next) => {
    const sauceObject = req.file ?
      {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
      } : { ...req.body };
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Objet modifié !' }))
      .catch(error => res.status(400).json({ error }));
  };

exports.delete = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
            .then(() => 
                res.status(200).json({ message: 'Objet supprimé !' }))
            .catch(error => 
                res.status(400).json({ error }));
        });
      })
      .catch(error => res.status(500).json({ error }));
  };

  exports.like = (req, res, next) => {
    switch (req.body.like) {
      case 0:
          console.log("ok");
        Sauce.findOne({ _id: req.params.id })
          .then((sauce) => {
            if (sauce.usersLiked.find(user => user === req.body.userId)) {
              Sauce.updateOne({ _id: req.params.id }, {
                $inc: { likes: -1 },
                $pull: { usersLiked: req.body.userId },
                _id: req.params.id
              })
                .then(() => { res.status(201).json({ message: 'Total modified' }); })
                .catch((error) => { res.status(400).json({ error: error }); });
            } if (sauce.usersDisliked.find(user => user === req.body.userId)) {
              Sauce.updateOne({ _id: req.params.id }, {
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
      case 1:
        Sauce.updateOne({ _id: req.params.id }, {
          $inc: { likes: 1 },
          $push: { usersLiked: req.body.userId },
          _id: req.params.id
        })
          .then(() => { res.status(201).json({ message: 'Sauce liked' }); })
          .catch((error) => { res.status(400).json({ error: error }); });
        break;
      case -1:
        console.log("ok");
        Sauce.updateOne({ _id: req.params.id }, {
          $inc: { dislikes: +1 },
          $push: { usersDisliked: req.body.userId },
          _id: req.params.id
        })
          .then(() => { res.status(201).json({ message: 'Sauce disliked' }); })
          .catch((error) => { res.status(400).json({ error: error }); });
        break;
  
      default:
        console.error('Wrong request');
    }
  };
  
