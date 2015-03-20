SavesData = new Mongo.Collection("savesd");

if (Meteor.isServer) {
  Meteor.publish('savesd', function() {
    return SavesData.find();
  });
  Meteor.methods({
    'removeAllBoxes': function() {
      SavesData.remove({});
    },
    'saveGrid' : function(id, json) {
      SavesData.insert({id: id, grid: json});
    },
    'updateGrid' : function(id, json){
      SavesData.update({_id: id}, {$set: {grid: json}});
    }
  });
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
