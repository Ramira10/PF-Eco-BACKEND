var express = require("express");
var router = express.Router();

let getProducts = require('../controllers/Products/getProducts')
let postProduct = require('../controllers/Products/postProduct.js')
let putProduct = require('../controllers/Products/putProduct.js')
let deleteProduct = require('../controllers/Products/deleteProduct.js');
const getProductByID = require("../controllers/Products/getProductByID");

router.get('/', getProducts);
router.get('/:id', getProductByID);
router.post('/', postProduct);
router.put('/:id', putProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
