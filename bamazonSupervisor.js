var mysql = require('mysql');
var inquirer = require('inquirer');
var Table = require('cli-table');

var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'bamazon_db', 
});

function supervisorFunc(){

	inquirer.prompt([
		{
			name:'select',
			type:'list',
			message:'What would you like to do',
			choices:['View Product Sales by Department','Create New Department','Exit']
		}
	]).then (function(answer){

		if (answer.select === 'View Product Sales by Department'){
			salesByDepartment();
		}else if ( answer.select === 'Create New Department'){
			createDepartment();
		}else if (answer.select === 'Exit') {
			connection.end();
		}		
	});
}

function salesByDepartment(){
	var query = 'SELECT D.DEPARTMENT_ID AS DEPT_ID, D.DEPARTMENT_NAME AS DEPT_NAME, '+ 
				'D.OVERHEAD_COSTS AS OVER_HEAD_COSTS, '+
				'SUM(PR.PRODUCT_SALES) AS PRODUCT_SALES '+
				'FROM DEPARTMENTS D, PRODUCTS PR WHERE D.DEPARTMENT_NAME = PR.DEPARTMENT_NAME '+
				'GROUP BY PR.DEPARTMENT_NAME';
	
	connection.query(query, function(err,res){
		if(err) throw err;

	var table = new Table({
		head:['department_id','department_name','over_head_costs','product_sales','total_profit']
	});

	console.log('DEPARTMENT ITEMS DISPLAYS HERE');
	console.log('------------------------------');

	for (var i = 0; i < res.length; i++){
		var overhead = res[i].OVER_HEAD_COSTS;
		overhead = overhead.toFixed(2);
		var totalSales = res[i].PRODUCT_SALES;
		totalSales = totalSales.toFixed(2);
		var TotalProfit = totalSales - overhead;
		TotalProfit = TotalProfit.toFixed(2);
		table.push([res[i].DEPT_ID, res[i].DEPT_NAME, '$' + overhead, '$' + totalSales, '$' + TotalProfit]);
	  }	
	console.log(table.toString());
    console.log("--------------------------------");
	});
	supervisorFunc();
}

function createDepartment(){
	inquirer.prompt([
		{
            type:'input',
            message:'Department Name? ',
            name:'department_name'
        },
        {
            type:'input',
            message:'What is the overhead for the department you would like to add?',
            name:'overHead'
        },
        {
            type:'input',
            message:'How mant Total sales are you done yet?',
            name:'totalSales'
        }
	]).then(function(answer){
		var totalSales = answer.totalSales;
		var overHead = answer.overHead; 
        var query = 'INSERT INTO Departments (department_name,OverHeadCosts,TotalSales,Total Profit)'+
                    ' VALUES ("' +      
                    answer.department_name + '",' +
                    overHead.toFixed(2)+ ',' + 
					totalSales.toFixed(2) +
					totalSales.toFixed(2) - overHead.toFixed(2) + ')';
		
		connection.query(query);
		console.log(query);
		salesByDepartment();
		supervisorFunc();
	});	
  }

supervisorFunc();