var mysql   = require('mysql');
var Table = require('cli-table');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    port     :3306,
    password : '',
    database : 'bamazon_db'
});

function displayItems(){
   connection.query('select * from products', function (error, results) {
    if (error) throw error;
    
    var table = new Table({
      head:['item_id', 'product_name','department_name','price','stock_quantity','product_sales']
    });
    //DISPLAYING ITEMS THAT ARE AVAILABLE
    console.log("ITEMS THAT ARE AVAILABLE FOR SALE:");
    console.log("==================================");
    for(var i = 0; i < results.length; i++){
      table.push([results[i].item_id, 
                  results[i].product_name, 
                  results[i].department_name, 
                  results[i].price, 
                  results[i].stock_quantity,
                  results[i].product_sales]);
    };    
    console.log(table.toString());
    console.log("==================================");

    inquirer.prompt([
      {
        type: 'input',
        message: 'Which item (id) would you like to buy?',
        name: 'choose_item_id',
        validate: function(value) {
          if (isNaN(value) == false) {
              return true;
          } else {
              return false;
          }
        } 
      },
      {
        type:'input',
        message: 'Choose quantity to buy',
        name: 'choose_quantity',
        validate: function(value) {
          if(isNaN(value) == false) {
            return true;
          } else {
            return false;
          }
        }
      }
    ]).then(function(answer){
      var chosenItemId = answer.choose_item_id; 
      var chosenItemQty = answer.choose_quantity;
      var flag = false; //FLAG TO CHECK IF THE CHOOSEN ITEM IS FROM THE AVAILABLE LIST OF ITEMS/PRODUCTS
      
      for (var i = 0; i < results.length; i++) {
        if(results[i].item_id == chosenItemId) {
          flag = true;
          if(chosenItemQty < results[i].stock_quantity){
            var totalPrice = chosenItemQty*results[i].price;
            console.log("Total price for " + chosenItemQty + " " + results[i].product_name + " is " + totalPrice);
            connection.query("UPDATE products SET ? WHERE ?", [{
              stock_quantity: results[i].stock_quantity - chosenItemQty,
              product_sales: results[i].product_sales + (chosenItemQty * results[i].price)
            }, {
                item_id: results[i].item_id
            }], function(error, results) {
                displayItems();
            }); 
          } 
          else {
            console.log("You have insufficient quantity of the Product. Please choose again");
            displayItems();
          }
          break;
        }
      }
      if(!flag){
        console.log("Please choose item from the available list of items");
        displayItems();
      }
    });
  });
}

displayItems();