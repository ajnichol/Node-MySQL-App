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

function showStock(){
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

function transaction(dbQuantity, customerPrice, productID){
	connection.query("UPDATE products SET ? WHERE item_id =" + productID, {stock_quantity: dbQuantity}, function(error, response){
		if(error){
			console.log(error);
		}else{
			console.log("You owe $" + customerPrice);
			inquirer.prompt([
			{
				name: "continue",
				type: "list",
				message: "Would you like to continue shopping?",
				choices: ["yes", "no"]
			}
			]).then(function(info){
				if(info.continue == "yes"){
					showStock();
				}else{
					console.log("Thanks for shopping at Alex's Emporium!")
				};
			});
		};
	});
};

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
		var splitId = answer.id.split(":");
		var getId = splitId[0];
		var userQuantity = answer.quantity;
		connection.query("SELECT item_id, stock_quantity, price FROM products", function(error, results){
			if(error){
				console.log(error);
			}else{
				for(var i = 0; i < results.length; i++){
					if(getId == results[i].item_id && userQuantity < results[i].stock_quantity){
						var productQuantity = results[i].stock_quantity;
						var productPrice = results[i].price;
						var userPrice = userQuantity * productPrice;
						var newQuantity = productQuantity - userQuantity;
						transaction(newQuantity, userPrice, getId);
					};

					if(getId == results[i].item_id && userQuantity > results[i].stock_quantity){
						console.log("We don't have enough in stock." + "\nPlease lower quantity.");
					};
				};
			};
		});
	});
};

showStock();


