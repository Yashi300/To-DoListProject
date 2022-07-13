//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const port = process.env.port || 8000;
const _=require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Yashi_7103:Yashi123@cluster0.rt2ewjo.mongodb.net/todolistDB");

const itemSchema = mongoose.Schema({
  name: String
});


const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit htis to delete an item."
});

const AllItem = [item1, item2, item3];

const listSchema = mongoose.Schema({
     name:String,
     items:[itemSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {

  Item.find({}, function (err, foundItems) {
    if(foundItems.length == 0)
    {
      Item.insertMany(AllItem, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Data saved successfully");
        }
      });
      res.redirect("/")
    }else{
    res.render("list", { listTitle: "Today", newListItems: foundItems});
    }
  });
});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name : customListName}, function(err, foundList){
    if(!err){
      if(!foundList)
      {
        const list = new List({
          name:customListName,
          items:AllItem
        });
        list.save();
        res.redirect("/" + customListName);
      } 
    else{
      res.render("list", { listTitle: foundList.name, newListItems: foundList.items});
    }
  }
});
});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item3 = new Item({
     name:itemName
  });

  if(listName == "Today")
  {
    item3.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item3);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
 
});

app.post("/delete", function(req,res){
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;

  if(listName == "Today")
  {
    Item.deleteOne({_id: checkedItem}, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Data deleted successfully");
      }
    });
    res.redirect("/");
  } else {
     List.findOneAndUpdate({name:listName},{$pull: {items: {_id: checkedItem}}},function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
     })
  }  
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(port, function () {
  console.log(`listning to the port no at ${port}`);
});
