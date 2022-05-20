const Cart = require("../../models/Cart.js");
const Product = require("../../models/Product.js");
const User = require("../../models/User.js");
const Detail = require("../../models/Detail.js");

const addProductCart = async (req, res, next) => {
  try {
    const { userId, productId, updated_quantity } = req.query;

    //Verifica que el usuario disponga de un carrito disponible
    const userHasCart = await User.findOne({
      where: {
        id: userId,
      },
      include: {
        model: Cart,
        where: {
          open: true,
        },
      },
    });

    //Verifica si el producto existe en la base de datos
    const producExists = await Product.findOne({
      where: {
        id: productId,
      },
    });

    //Verificar si el producto ya se encuentra dentro del carrito
    const productInCart = await Cart.findOne({
      where: {
        userId: userId,
      },
      include: {
        model: Detail,
        include: {
          model: Product,
          where: {
            id: productId,
          },
        },
      },
    });

    //console.log(productInCart.details[0]["bundle"]);

    //////////

    if (!userHasCart) {
      await Cart.create({
        payment_method: null,
        date: null,
        status: null,
        oppen: true,
        userId: userId,
        price_total: 1
      });

      const cart = await searchCart(userId);

      await producExists.addCart(cart);

      //Ingresar el nuevo dato a los detalles del carrito
      const purchaseDetails = await Detail.create({
        name: producExists.name,
        img: producExists.img[0],
        price: producExists.price,
        price_total: producExists.price * 1,
        bundle: 1,
        stock: producExists.stock,
        date: new Date(),
        cartId: cart.id,
        productId: productId,
      });

      res.send(purchaseDetails);
    } else if (!producExists || producExists.stock < 1) {
      res.status(400).json({
        message: "Producto no disponible",
      });
    }

    if (productInCart && updated_quantity === "sum") {
      await Detail.update(
        {
          bundle: productInCart.details[0]["bundle"] + 1,
          price_total: producExists.price * productInCart.details[0]["bundle"],
        },
        {
          where: {
            productId: productId,
          },
        }
      );

      res.status(200).send(
          `Producto actualizado, la cnatidad actualizada pasa a ser de: ${1}`
        );

    }else if(productInCart && updated_quantity === "rest" && productInCart.details[0]["bundle"] <= 1 ){
      res.send("No se puede restar mas de uno");
    }else if (productInCart && updated_quantity === "rest") {
      await Detail.update({
          bundle: productInCart.details[0]["bundle"] - 1,
          price_total: producExists.price * productInCart.details[0]["bundle"],
        },
        {
          where: {
            productId: productId,
          },
        }
      );

      res.status(200).send(
          `Producto actualizado, la cnatidad actualizada pasa a ser de: ${1}`
        );

    } else if (userHasCart && producExists) {
      const cart = await searchCart(userId);

      await producExists.addCart(cart);

      //Ingresar el nuevo dato a los detalles del carrito
      const purchaseDetails = await Detail.create({
        name: producExists.name,
        img: producExists.img[0],
        price: producExists.price,
        price_total: producExists.price * 1,
        bundle: 1,
        stock: producExists.stock,
        date: new Date(),
        cartId: cart.id,
        productId: productId,
      });

      res.send(purchaseDetails);
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};

module.exports = addProductCart;

const searchCart = async (userId) => {
  try {
    const r = await Cart.findOne({
      where: {
        userId: userId,
      },
    });

    return r;
  } catch (err) {
    console.log(err);
  }
};

/*
else if (userHasCart) {
      const cart = await searchCart(userId)

      await producExists.addCart(cart);

      //Ingresar el nuevo dato a los detalles del carrito
      const purchaseDetails = await Detail.create({
        name: producExists.name,
        img: producExists.img[0],
        price: producExists.price,
        price_total: producExists.price * 1,
        bundle: 1,
        stock: producExists.stock,
        date: new Date(),
        cartId: cart.id,
        productId: productId,
      });

      res.send(purchaseDetails);

    }

*/
