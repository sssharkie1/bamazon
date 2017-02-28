var mysql = require("mysql");
var inquirer = require("inquirer");
var prompt = require("prompt"); 

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,


  user: "",

  password: "",  
  database: "bamazon_db"
});

connection.connect(function(err) {
  if(err){
    console.log('Error connecting to Bamazon_db');
    return;
  }
  console.log('Connection to Bamazon database complete.');
});


var itemList = function() { 
  connection.query("SELECT * FROM products", function(err, res) {
    console.log("Items for sale:");
    for (var i=0; i<res.length; i++) {
      console.log("Item Number: " + res[i].item_id + " |  Product Name: " + res[i].product_name 
      + " | Price: " + res[i].price + " | Stock Quantity: " + res[i].stock_quantity);
    }
      console.log("-----------------------------------");
    custSelect();
  });  
};

function custSelect(){

  var item = {
    properties: {
      id: {
        description: "What item would you like to buy?  (Please use Item Number provided)?"
      }
    }
  }

var quantity = {
  properties: {
    quantity: {
      description: "Please enter the quantity you would like to buy"
      }
    }
  };
  prompt.start();
  prompt.get([item,quantity], function(err,data){
      buyItem(data.id, data.quantity);
  })
};

function buyItem(itemId, quantity){
  connection.query('SELECT * FROM `Products` WHERE `item_id` = "' + itemId + '"' , function(err, rows, fields) {
    if (err) throw err;

    for (i = 0; i < rows.length; i++){
      var finalTotal = rows[i].price * quantity;
      var newQuantity = rows[i].stock_quantity - quantity;
      if (quantity > rows[i].stock_quantity){
        console.log(rows[i].stock_quantity);
        console.log(" ");
        console.log("Insufficient quantity! Please try again!");
        console.log(" ");
        itemList();
      } else {
        console.log(" ");
        console.log("We have fulfilled your order!  Here is your receipt: ");
        console.log("-----------------------------");
        console.log("| ");
        console.log("| Quantity Purchased: " + quantity);
        console.log("| ");
        console.log("| Name: " + rows[i].product_name); 
        console.log("| ");
        console.log("| Price per item: $" + rows[i].price);
        console.log("| ");
        console.log("| Total: $" + finalTotal);
        console.log("| ");
        console.log("-----------------------------");
        console.log("Thank you for shopping with Bamazon!");
        console.log(" ");
        updateSQL(itemId, newQuantity);

      }
    }
  });
}

function updateSQL(itemId, newQuantity){
  connection.query('UPDATE `products` SET `stock_quantity` = "' + newQuantity + '" WHERE `item_id` = "' + itemId + '"', function(err, rows, fields) {
    if (err) throw err;
    inquirer.prompt([
    {
      type: "list",
      message: "Would you like to keep shopping?",
      choices: ["Yes", "No"],
      name: "choice"
    }
    ]).then(function (answers) {
      if (answers.choice == "Yes"){
        itemList();
      } else {
        console.log(" ");
        console.log("Thank you for your patronage, please come back soon!");
        console.log(" ");

        connection.end();
      }
    });
  });
}


itemList();



