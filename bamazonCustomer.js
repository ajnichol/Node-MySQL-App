var mysql = require("mysql");
var inquirer = require("inquirer");
var choicesArray = [];

var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "AaNichol91!",
	database: "bamazon"
});

connection.connect(function(error){
	if(error){
		console.log(error);
	}
});

function showResults(){
	connection.query("SELECT * FROM products", function(error, results){
		if(error){
			console.log(error);
		}else{
			for(var i = 0; i < results.length; i++){
				console.log("ID: " + results[i].item_id);
				console.log("Product: " + results[i].product_name);
				console.log("Price: " + "$" + results[i].price);
				choicesArray.push(results[i].item_id + ": " + results[i].product_name);
			};
		userInput();
		};
	});
};

function updateDatabase(){
	connection.query("UPDATE products SET ?", function(error, response){
		if(error){
			console.log(error);
		}else{

		}
	})
}

function userInput(){
	inquirer.prompt([
	{
		name: "id",
		type: "list",
		message: "What product would you like to buy?",
		choices: choicesArray
	},
	{
		name: "quantity",
		type: "input",
		message: "How many would you like to purchase?"
	}
	]).then(function(answer){
		console.log(answer.id);
		console.log(answer.quantity);
		var splitId = answer.id.split(":");
		var getId = splitId[0];
		console.log(getId);
		var quantity = answer.quantity;
		connection.query("SELECT ? FROM products", {item_id: getId}, function(error, results){
			if(error){
				console.log(error);
			}else{
				console.log(results);
			}
		});
	});
}

showResults();


