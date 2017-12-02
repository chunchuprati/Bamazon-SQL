drop database if exists bamazon_db;

create database bamazon_db;

use bamazon_db;

create table products(
	item_id int NOT NULL AUTO_INCREMENT ,
    
    product_name varchar(30) not null,
    
    department_name varchar(30),
    
    price float(10,2),
    
    stock_quantity integer(10),
    
    primary key (item_id)
);
    
    