//requiring mysql database for use
var mysql = require("mysql");
//requring the node package inquirer for user prompt
var inquirer = require("inquirer");
//array we will use for choices in our inquirer prompt
var choicesArray = [];
//connecting to our database 
var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "AaNichol91!",
	database: "bamazon"
});
//checking if there is an error connecting to the database
connection.connect(function(error){
	if(error){
		console.log(error);
	}
});
//initial function that is going to display all our inventory and prices to the user
function showStock(){
	//search query that is selecting everything in our products table
	connection.query("SELECT * FROM products", function(error, results){
		if(error){
			console.log(error);
		}else{
			//looping through our table and grabbing our id, product, and price for each product
			for(var i = 0; i < results.length; i++){
				console.log("ID: " + results[i].item_id);
				console.log("Product: " + results[i].product_name);
				console.log("Price: " + "$" + results[i].price);
				//pushing product id and name back up to our choicesArray for use in inquirer
				choicesArray.push(results[i].item_id + ": " + results[i].product_name);
			};
		//calling our user input function to ask our user which product they would like to buy	
		userInput();
		};
	});
};
//function that accepts three arguments from our user input function. Passes in updated quantity, what the user should pay, and product id
function transaction(dbQuantity, customerPrice, productID){
	//query to update the quantity passed in from user input
	connection.query("UPDATE products SET ? WHERE item_id =" + productID, {stock_quantity: dbQuantity}, function(error, response){
		if(error){
			console.log(error);
		}else{
			//showing our user what they should pay
			console.log("You owe $" + customerPrice);
			//then asking them if they would like to continue shopping
			inquirer.prompt([
			{
				name: "continue",
				type: "list",
				message: "Would you like to continue shopping?",
				choices: ["yes", "no"]
			}
			]).then(function(info){
				//if user would like to continue you shopping we show them our inventory
				if(info.continue == "yes"){
					showStock();
				}else{
					console.log("Thanks for shopping at Alex's Emporium!")
				};
			});
		};
	});
};
//function that uses the inquirer package to gather data
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
		//splitting our id from product name
		var splitId = answer.id.split(":");
		//storing only the id in a variable
		var getId = splitId[0];
		//storing how much the user would like to purchase
		var userQuantity = answer.quantity;
		//querying the database to get item id, quantity, and price
		connection.query("SELECT item_id, stock_quantity, price FROM products", function(error, results){
			if(error){
				console.log(error);
			}else{
				//looping through our products table
				for(var i = 0; i < results.length; i++){
					//if the product choosen's id matches an id in our databse and its quantity is less than the quantity in our database, user may purchase the item(s)
					if(getId == results[i].item_id && userQuantity < results[i].stock_quantity){
						//storing database product quantity
						var productQuantity = results[i].stock_quantity;
						//storing database product price
						var productPrice = results[i].price;
						//multiplying how many products the user wants to the price of each item
						var userPrice = userQuantity * productPrice;
						//updating our quantity by subtracting how much our user chooses and how much is in our database
						var newQuantity = productQuantity - userQuantity;
						//calling our transaction function and passing it updated product quantity, price, and product id
						transaction(newQuantity, userPrice, getId);
					};
					//if the user chooses a quantity higher than what is in our database, we will let them know
					if(getId == results[i].item_id && userQuantity > results[i].stock_quantity){
						console.log("We don't have enough in stock." + "\nPlease lower quantity.");
					};
				};
			};
		});
	});
};
//intially calling our showStock function to display everything in our database
showStock();


