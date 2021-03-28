

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



// DataBase

mongoose.connect("mongodb+srv://admin-samarth:Test123@cluster0.otbyt.mongodb.net/todolistDB" , {useNewUrlParser:true , useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);

const itemsSchema = new mongoose.Schema({
  name:String
});

const Item = mongoose.model("Item" , itemsSchema);

const item1 = new Item({
  name: "Welcome to ToDolist"
});
const item2 = new Item({
  name: "To Add Items Press '+'"
});
const item3 = new Item({
  name: "<-- click this to delete item"
});

const defaultItem = [item1 , item2 , item3];


const listSchema = new mongoose.Schema({
  name : String,
  items: [itemsSchema],
});

const List = mongoose.model("List", listSchema);


// get and post methods

app.get("/", function(req, res) {

  Item.find({} , function(err , foundItems){

    if(foundItems.length === 0){
      Item.insertMany(defaultItem , function(err){
        if(err){
          console.log(err);
        }else{
          console.log("success");
        }
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

  });
});

app.get("/:customListName", function(req , res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err , foundList){
    if(!err){
      if(!foundList){
        // create a list of name customListName

        const list = new List({
          name: customListName,
          items: defaultItem
        });
        list.save();

        res.redirect("/" +customListName);

      }else{
        // show the list with is req by customListName

        res.render("list" , {listTitle: foundList.name, newListItems: foundList.items} );
      }
    }
  });



})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: itemName
  });

  if(listName === "Today"){
    newItem.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName}, function(err, foundList){
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/"+listName)
    })
  }


});

app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      console.log("deleted");
    });
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name:listName} , {$pull : {items : {_id: checkedItemId}}} , function(err , foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }


});



app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started succesfully");
});
