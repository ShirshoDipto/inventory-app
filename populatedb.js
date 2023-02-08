#! /usr/bin/env node

console.log('This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Category = require('./models/category')
var Item = require('./models/item')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var categories = []
var items = []

function categoryCreate(name, description, cb) {
  categorydetail = {name: name , description: description }
  
  var category = new Category(categorydetail);
       
  category.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Category: ' + category);
    categories.push(category)
    cb(null, category)
  }  );
}

function itemCreate(name, description, price, number_in_stock, categories, cb) {
  itemdetail = { 
    name: name,
    description: description,
    price: price,
    number_in_stock: number_in_stock,
    categories: categories
  }
    
  var item = new Item(itemdetail);    
  item.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Item: ' + item);
    items.push(item)
    cb(null, item)
  }  );
}

function createItems(cb) {
    async.parallel([
        function(callback) {
          itemCreate('Item 1', 'I have stolen princesses back from sleeping barrow kings. I burned down the town of Trebon. I have spent the night with Felurian and left with both my sanity and my life. I was expelled from the University at a younger age than most people are allowed in. I tread paths by moonlight that others fear to speak of during day. I have talked to Gods, loved women, and written songs that make the minstrels weep.', '$100', '1', [categories[0],], callback);
        },
        function(callback) {
          itemCreate("Item 2", 'Picking up the tale of Kvothe Kingkiller once again, we follow him into exile, into political intrigue, courtship, adventure, love and magic... and further along the path that has turned Kvothe, the mightiest magician of his age, a legend in his own time, into Kote, the unassuming pub landlord.', '$200', '2', [categories[0],], callback);
        },
        function(callback) {
          itemCreate("Item 3", 'Deep below the University, there is a dark place. Few people know of it: a broken web of ancient passageways and abandoned rooms. A young woman lives there, tucked among the sprawling tunnels of the Underthing, snug in the heart of this forgotten place.', '$300', '3', [categories[0],], callback);
        },
        function(callback) {
          itemCreate("Item 4", "Humankind headed out to the stars not for conquest, nor exploration, nor even for curiosity. Humans went to the stars in a desperate crusade to save intelligent life wherever they found it. A wave of death is spreading through the Milky Way galaxy, an expanding sphere of lethal gamma ...", '$400', '4', [categories[1],], callback);
        },
        function(callback) {
          itemCreate("Item 5","In Ben Bova's previous novel New Earth, Jordan Kell led the first human mission beyond the solar system. They discovered the ruins of an ancient alien civilization. But one alien AI survived, and it revealed to Jordan Kell that an explosion in the black hole at the heart of the Milky Way galaxy has created a wave of deadly radiation, expanding out from the core toward Earth. Unless the human race acts to save itself, all life on Earth will be wiped out...", '$500', '5', [categories[1],], callback);
        },
        function(callback) {
          itemCreate('Item 6', 'Summary of description 1', '$600', '6', [categories[0],categories[1]], callback);
        },
        function(callback) {
          itemCreate('Item 7', 'Summary of description 2', '$700', '7', [categories[1],categories[2]], callback)
        }
        ],
        // optional callback
        cb);
}


function createCategories(cb) {
    async.parallel([
        function(callback) {
          categoryCreate('Category 1', 'Some Random description 1. Some Random description 1. Some Random description 1. Some Random description 1. Some Random description 1. ', callback)
        },
        function(callback) {
          categoryCreate('Category 2', 'Some Random description 2. Some Random description 2. Some Random description 2. Some Random description 2. Some Random description 2. ', callback)
        },
        function(callback) {
          categoryCreate('Category 3', 'Some Random description 3. Some Random description 3. Some Random description 3. Some Random description 3. Some Random description 3. ', callback)
        }],
        // Optional callback
        cb);
}

async.series([
    createCategories,
    createItems
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('Categories: '+categories);
    }
    // All done, disconnect from database
    mongoose.connection.close();
});