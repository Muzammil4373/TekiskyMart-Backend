import Order from "../models/orderModel.js";

import ProductModel from "../models/productModel.js";

import { getOneProduactService } from "./adminServices.js";
const saveOrder = async (data) => {
  try {
    for (let i = 0; i < data.products.length; i++) {
      // Assuming getOneProduactService returns a product document
      let product = await getOneProduactService(data.products[i].product);
      console.log(product, "product for order");

      // Check if product details array is empty
      if (!product.productDetails || product.productDetails.length === 0) {
        console.error("No product details found for the product:", product);
        throw new Error("No product details found for the product");
      }

      // Log product details for debugging
      console.log("Product Details:", product.productDetails);

      // Find the index of the selected product weight in the productDetails array
      const weightIndex = product.productDetails.findIndex(
        (details) => details.packetweight === data.products[i].packetweight
      );

      // Check if the weightIndex is valid
      if (weightIndex  ==-1 ){
        console.error("Invalid weight index for product:", product);
        console.error("Order Packet Weight:", data.products[i].packetweight);
        throw new Error("Invalid weight index for product");
      }

      // Update the availableStockQty based on the correct index
      product.productDetails[weightIndex].availableStockQty -= parseInt(
        data.products[i].quantity,
        10
      );

      console.log(
        "Updated availableStockQty:",
        product.productDetails[weightIndex].availableStockQty
      );

      // Update the product in the database
      await ProductModel.updateOne(
        {
          "_id": product._id,
          "productDetails._id": product.productDetails[weightIndex]._id
        },
        {
          $set: {
            "productDetails.$.availableStockQty":
              product.productDetails[weightIndex].availableStockQty,
          },
        }
      );
    }

    // Create and save the order
    const order = new Order({ ...data });
    const result = await order.save();

    if (result) {
      console.log('Order added successfully');
      return 'successful';
    }
  } catch (error) {
    console.error("Error adding order:", error);
    throw new Error("Failed to add order");
  }
};

let getAllOrders = async () => {
  try {
    let allOrders = await Order.find();
    console.log(allOrders);
    return allOrders;
  } catch (err) {
    console.error('Error in fetching orders:', err);
    throw new Error('Error in fetching orders');
  }
};

let getOrderById = async (id) => {
  try {
    console.log(id);
    let order = await Order.findById(id);
    return order;
  } catch (err) {
    console.error('Error in fetching order:', err);
    throw new Error('Error in fetching order');

  }
};

let deleteOrderById = async (id) => {
  try {
    //console.log(req.params.id);
    let orderDeleted = await Order.findByIdAndDelete(id);
    return orderDeleted;
  } catch (err) {
    console.error('Error in deleting the  orders:', err);
    throw new Error('Error in deleting orders');
  }
};

let updateOrderById = async (id, updateData) => {
  try {
    // console.log(req.params.id);
    let orderUpdated = await Order.findByIdAndUpdate(id, updateData, { new: true });
    return orderUpdated;
  } catch (err) {
    console.error('Error in updating the  order:', err);
    throw new Error('Error in fetching order');
  }
};


export { saveOrder, getAllOrders, getOrderById, deleteOrderById, updateOrderById };
