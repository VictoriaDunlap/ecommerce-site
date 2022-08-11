const router = require('express').Router();
// const { json } = require('sequelize/types');
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  // find all categories
  // be sure to include its associated Products
  try{
    const categoryData = await Category.findAll({
      include: [{model:Product}]
    })
    res.status(200).json(categoryData)
  } catch (err) {
    res.status(500).json(err)
  }
});

router.get('/:id', async (req, res) => {
  // find one category by its `id` value
  // be sure to include its associated Products
  try {
    const categoryData = await Category.findByPk(req.params.id, {
      include: [{model:Product}]
    })

    if (!categoryData) {
      res.status(404).json({message: 'No category with this id detected'})
      return
    }

    res.status(200).json(categoryData)
  } catch (err) {
    res.status(500).json(err)
  }
});

router.post('/', async (req, res) => {
  // create a new category
  try {
    const categoryData = await Category.create(req.body)
    res.status(200).json(categoryData)
  } catch (err) {
    res.status(400).json(err)
  }
});

router.put('/:id', async(req, res) => {
  // update a category by its `id` value
    const categoryData = await Category.update(req.body, {
      where: {
        id: req.params.id
        }
      })
      .then((category) => {
        return Category.findAll({ where: { category_id: req.params.id } });
      })
      .then((category) => {
        // get list of current category_ids
        const categoryIds = category.map(({ category_id }) => category_id);
        // create filtered list of new category_ids
        const newcategories = req.body.categoryIds
          .filter((category_id) => !categoryIds.includes(category_id))
          .map((category_id) => {
            return {
              id: req.params.id,
              category_id,
            };
          });
        // figure out which ones to remove
        const categoriesToRemove = category
          .filter(({ category_id }) => !req.body.categoryIds.includes(category_id))
          .map(({ id }) => id);
  
        // run both actions
        return Promise.all([
          Category.destroy({ where: { id: categoriesToRemove } }),
          Category.bulkCreate(newcategories),
        ]);
      })
      .then((updatedCategories) => res.json(updatedCategories))
      .catch((err) => {
        // console.log(err);
        res.status(400).json(err);
      });
});

router.delete('/:id', async (req, res) => {
  // delete a category by its `id` value
  try {
    const categoryData = await Category.destroy({
      where: {
        id: req.params.id
      }
    })
    if (!categoryData) {
      res.status(404).json({ message: "Category not found"})
      return
    }
  } catch (err) {
    res.status(500).json(err)
  }
});

module.exports = router;
