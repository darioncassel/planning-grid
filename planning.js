SavesData = new Mongo.Collection("saves");

Router.configure({
	layoutTemplate: 'ApplicationLayout'
});

Router.route('/', function(){this.render('Grid');});
Router.route('/:id', function() {
	Session.set(beforeLoad, true);
  this.wait(Meteor.subscribe('savesd'));
  this.render('Grid');
  var id = this.params.id;
  Meteor.setTimeout(function() {
    loadGrid(id);
		Session.set(beforeLoad, false);
  }, 1000);
});


if (Meteor.isClient) {

  Meteor.subscribe("savesd");
	var onEditGrid = new Tracker.Dependency;
	var beforeLoad = new ReactiveVar;

	Template.Grid.helpers({
		'save': function() {
			onEditGrid.depend();
			if(!Session.get(beforeLoad)){
				var id = window.location.pathname.slice(1);
				if(id!=''){
					saveGrid(id);
				}else{
					var id = generateUUID();
					saveGrid(id);
					window.location=id;
				}
			}
			return "Saving...";
		}
	});

  Template.Grid.rendered = function() {
    var gridster = $(".gridster > ul").gridster({
      widget_margins: [10, 0],
      widget_base_dimensions: [80, 80],
      min_cols: 10,
      resize: {
          enabled: false
      },
			draggable: {
				stop: function() {
					setTimeout(function(){
						onEditGrid.changed();
						return null;
					}, 500);
				}
			}
    }).data('gridster');
  }

  Template.Grid.events({
    'click button[name=add]': function() {
      var id = '000000'.replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
      addWidget(id);
			onEditGrid.changed();
    },
    'click button[class=edit]': function(event) {
      function bootboxContent1() {
        var str= "<div id='modifyEvent'>\
          <p><input type='radio' value='e74c3c' name='color'>   Red</input>\
             <input type='radio' value='f39c12' name='color'>   Orange</input>\
             <input type='radio' value='f1c40f' name='color'>   Yellow</input>\
             <input type='radio' value='2ecc71' name='color'>   Green</input></p>\
          <p><input type='checkbox' id='isDone'>  Done</input></p>\
        </div>";
        var object = $('<div/>').html(str).contents();
        return object;
      }
      bootbox.dialog({
        backdrop: false,
        title: "Modify",
        message: bootboxContent1,
        className: 'modify',
        buttons: {
          main: {
            label: "Delete",
            className: "btn btn-danger",
            callback: function () {
              var id = event.target.id
              removeWidget(id);
							setTimeout(function(){onEditGrid.changed();}, 1000);
            }
          },
          secondary: {
            label: "Save",
            className: "btn btn-info",
            callback: function () {
              var color = $('input[name=color]:checked').val();
							if(color!=undefined){
              	$('#'+event.target.id).css('color', '#fff');
							}
              $('#'+event.target.id).css('background', '#'+color);
              if($('#isDone').is(':checked')){
                $('#'+event.target.id).css('opacity', '0.4');
              }
							onEditGrid.changed();
            }
          }
        }
      });
    },
		'keyup .title': function() {
			onEditGrid.changed();
		},
		'keyup .box': function() {
			onEditGrid.changed();
		}
  });

  function saveGrid(id) {
    var arr = $('.gridster').find('ul').children();
    var s = [];
    s.push($('.title').val());
    for(i=0;i<arr.length;i++){
      var box = {
        id: arr[i].id,
        text: $('#'+arr[i].id).find('input').val(),
        background: $('#'+arr[i].id).css('background'),
        color: $('#'+arr[i].id).css('color'),
        opacity: $('#'+arr[i].id).css('opacity'),
        col: $('#'+arr[i].id).attr('data-col'),
        row: $('#'+arr[i].id).attr('data-row')
      }
      s.push(box);
    }
    var saved = SavesData.findOne({id: id});
    if(saved==undefined){
      Meteor.call('saveGrid', id, JSON.stringify(s));
    }else{
      Meteor.call('updateGrid', saved._id, JSON.stringify(s));
    }
  }

  function loadGrid(id) {
    var gridster = $(".gridster > ul").gridster().data('gridster');
    var s = JSON.parse(SavesData.findOne({id:id}).grid);
    gridster.remove_all_widgets();
    $('.title').val(s[0]);
    for(i=1;i<s.length;i++){
      var thi = s[i];
      gridster.add_widget("<li id="+thi.id+" style='background:"+thi.background+";\
      opacity:"+thi.opacity+";color:"+thi.color+";'><input type='text' placeholder='content' value='"+thi.text+"' \
      class='box' action='boxCallback' on='key=press'>\
      <button id="+thi.id+" class='edit'>=</button></li>", 2, 1, thi.col, thi.row);
    }
  }

  function addWidget(id){
    var gridster = $(".gridster > ul").gridster().data('gridster');
    gridster.add_widget("<li id="+id+">\
    <input type='text' placeholder='content' value='' class='box' action='boxCallback' on='key=press'>\
    <button id="+id+" class='edit'>=</button></li>", 2, 1);
  }

  function removeWidget(id){
    var gridster = $(".gridster > ul").gridster().data('gridster');
    gridster.remove_widget($('#'+ id));
  }

  function generateUUID() {
    var d = Date.now();
    var uuid = 'xxxx-4xxx-yxxx'.replace(/[xy]/g,function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
  }

}
