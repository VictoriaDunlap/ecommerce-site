const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', (req, res) => {
  // find all tags
  // be sure to include its associated Product data
  try {
    const tagData = await Tag.findByPk(req.params.id, {
      include: [{model:Product, through: ProductTag}]
    })

    if (!tagData) {
      res.status(404).json({message: 'No tag with this id detected'})
      return
    }

    res.status(200).json(tagData)
  } catch (err) {
    res.status(500).json(err)
  }
});

router.get('/:id', (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
  try {
    const tagdata = await Tag.findByPk(req.params.id, {
      include: [{model:Product}]
    })

    if (!tagdata) {
      res.status(404).json({message: 'No product with this id detected'})
      return
    }

    res.status(200).json(tagdata)
  } catch (err) {
    res.status(500).json(err)
  }
});

router.post('/', (req, res) => {
  // create a new tag
  Tag.create(req.body)
  .then((tag) => {
  
    if (req.body.tagIds.length) {
      const tagIdArr = req.body.tagIds.map((tag_id) => {
        return {
          tag_id: tag.id,
        };
      });
      return Tag.bulkCreate(tagIdArr);
    }

    res.status(200).json(tagIdArr);
  })
  .then((tagIds) => res.status(200).json(tagIds))
  .catch((err) => {
    console.log(err);
    res.status(400).json(err);
  });
});

router.put('/:id', (req, res) => {
  // update a tag's name by its `id` value
  Tag.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((tag) => {
     
      return Tag.findAll({ where: { tag_id: req.params.id } });
    })
    .then((tag) => {
      // get list of current tag_ids
      const tagIds = tag.map(({ tag_id }) => tag_id);
      // create filtered list of new tag_ids
      const newTags = req.body.tagIds
        .filter((tag_id) => !tagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            tag_id: req.params.id,
          };
        });
      // figure out which ones to remove
      const tagsToRemove = tag
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      // run both actions
      return Promise.all([
        ProductTag.destroy({ where: { id: tagsToRemove } }),
        ProductTag.bulkCreate(newTags),
      ]);
    })
    .then((updatedTags) => res.json(updatedTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', (req, res) => {
  // delete on tag by its `id` value
  try {
    const tagData = await Tag.destroy({
      where: {
        id: req.params.id
      }
    })
    if (!tagData) {
      res.status(404).json({ message: "Tag not found"})
      return
    }
  } catch (err) {
    res.status(500).json(err)
  }
});

module.exports = router;
