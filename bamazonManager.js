var mysql   = require('mysql');
var Table = require('cli-table');
var inquirer = require('inquirer');
var colors = require('colors');

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    port     :3306,
    password : '',
    database : 'bamazon_db'
});

function managerFunc(){
inquirer.prompt([
    {
        type:'list',
        message:'What would you like to do?',
        choices:[' View Products for Sale','View Low Inventory','Add to Inventory','Add New Product'],
        name:'choose'
    }
]).then (function(answer){
    if (answer.choose === ' View Products for Sale'){
        viewProductsSale();
    }else if (answer.choose === 'View Low Inventory'){
        viewLowInventory();
    }else if (answer.choose === 'Add to Inventory'){
        addToInventory();
    }else if (answer.choose === 'Add New Product'){
        addNewProduct();
    }
});
}
//This Function should list every available item: the item IDs, names, prices, and quantities
function viewProductsSale(){
    connection.query('select * from products', function(error,results){
        if(error) {
            console.log(error);
            throw error;
        }
        var table = new Table({
            head:['item_id','product_name','department_name','price','stock_quantity']
        });
        console.log("ITEMS THAT ARE AVAILABLE FOR SALE ARE")
        console.log('=====================================');

        for (var i = 0; i < results.length; i++){
            table.push([results[i].item_id,
                        results[i].product_name,
                        results[i].department_name,
                        results[i].price,
                        results[i].stock_quantity
            ]);
        };
        console.log(table.toString());
        console.log('====================================');

    });
}//End of viewProductsSale function

//This function should list all items with an inventory count lower than "five".
function viewLowInventory(){
    connection.query('select * from products where stock_quantity < 5', function(error, results){
        if (error) throw error;
            if (results.length === 0){
                console.log('There are currently no items with Low Inventory!');
            }else{
                var table = new Table({
                head:['item_id','product_name','department_name','price','stock_quantity']
                });
                console.log("These are all the items that are low on inventory")
                console.log('=====================================');
        
                for (var i = 0; i < results.length; i++){
                    table.push([results[i].item_id,
                                results[i].product_name,
                                results[i].department_name,
                                results[i].price,
                                results[i].stock_quantity
                    ]);
                };
                console.log(table.toString());
                console.log('====================================');
            }
    });
}//End of Low inventory Function.

//This Function should display a prompt that will let the manager "add more" of any item currently in the store
function addToInventory(){
    var item = [];
    connection.query('select * from products', function(error,results){
        if (error) throw error;
        for ( var i = 0; i < results.length; i++){
            item.push(results[i].product_name);
        }

        inquirer.prompt([
            {
                type:'checkbox',
                name:'choices',
                message:'Which product would you like to update inventory for?',
                choices:item
            }, {
                type: 'input',
                message: 'By how many?',
                name: 'qtyToBeUpdated',
                validate: function(value) {
                    if(isNaN(value) == false) {
                      return true;
                    } else {
                      return false;
                    }
                }
            }
        ]).then(function(answer){
            if ( answer.choices.length === 0){
                console.log('Oops! You didn\'t select anything!');
                managerFunc();
            }else{
                updateInventory(answer);
            }
        });
    });
}

//THIS FUNCTION ASK THE CUSTOMER HOW MANY ITEMS HE WOULD LIKE TO ADD?
function updateInventory(product){
    //console.log('updateInventory');
    connection.query('UPDATE products SET ? WHERE ?', [
        {
            stock_quantity: product.qtyToBeUpdated
        },
        {
            product_name: product.choices
        }
    ],function(error, results){
        viewProductsSale();
        managerFunc();
    });
}

//This Function should display a series of prompts to gather information about a new Product to be added to the DB
function addNewProduct(){
    inquirer.prompt([
        {
            type:'input',
            message:'Product ID?',
            name: 'product_id'
        },
        {
            type:'input',
            message:'Product Name? ',
            name:'product_name'
        },
        {
            type:'input',
            message:'Department Name? ',
            name:'department_name'
        },
        {
            type:'input',
            message:'Price of the product? ',
            name:'product_price'
        },
        {
            type:'input',
            message:'Initial Quantity of the product? ',
            name:'stock_quantity'
        }
    ]).then(function(answer){
        var query = 'INSERT INTO products (item_id, product_name, department_name, price, stock_quantity)'+
                    ' VALUES (' +
                    answer.product_id + ',"'+ 
                    answer.product_name + '","' +
                    answer.department_name + '",' + 
                    answer.product_price + ',' + 
                    answer.stock_quantity + ')';
        
        connection.query(query);
        viewProductsSale(); 
        managerFunc();
    });
}

managerFunc();