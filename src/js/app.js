/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');
var Settings = require('settings');


Settings.config(
  { url: 'https://bkbilly.github.io/Tvheadend-EPG/?'+encodeURIComponent(JSON.stringify(Settings.option())) },
  function(e) {
    console.log('opening configurable');
  },
  function(e) {
    console.log('closed configurable');
    console.log(JSON.stringify(e.options));
    Settings.option(e.options);
    init();
  }
);

var channelsMenu;
var epgMenu;
var cardInfo;

var user;
var password;
var address;
var port;
init();

function init(){
  user = Settings.option('UserName_ID');
  password = Settings.option('Password_ID');
  address = Settings.option('IP_ID');
  port = Settings.option('Port_ID');
  if(user !== undefined && password !== undefined && address !== undefined && port !== undefined)
    createChannelsMenu();
  else
    createErrorCard("No Config", "Change the configuration page on your phone");
}

function hideAll(){
  try{
    channelsMenu.hide();
  }catch(err) {
    console.log(err.message);
  }
  try{
    epgMenu.hide();
  }catch(err) {
    console.log(err.message);
  }
  try{
    cardInfo.hide();
  }catch(err) {
    console.log(err.message);
  }
}

function createErrorCard(title, description){
  hideAll();
  cardInfo = new UI.Card({
    title: title,
    body: description,
    scrollable: true
  });
  cardInfo.show()
}

function createChannelsMenu() {
  hideAll();
  var loadChannels = function(){
    ajax(
      {
        url: 'http://'+user+':'+password+'@'+address+':'+port+'/api/channel/list',
        type: 'json'
      },
      function(data, status, request) {
        var items = [];
        for (var i = 0; i < data.entries.length; i++) {
          items.push({
            title: data.entries[i].val,
            uuid: data.entries[i].key
          });
        }
        channelsMenu.items(0, items);
        channelsMenu.selection(0, 0);
      },
      function(error, status, request) {
        createErrorCard("Connection Error", "Can't connect to Tvheadend");
      }
    );
  }

  channelsMenu = new UI.Menu({
    highlightBackgroundColor: '#bf00ff',
    sections: [{
      items: [{
        title: 'Loading Data'
      }]
    }]
  });
  channelsMenu.on('select', function(e) {
    console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
    console.log('The item is titled "' + e.item.title + '"');
    createEpgMenu(e.item.uuid);
  });
  channelsMenu.show();
  loadChannels();

}

function createEpgMenu(uuid) {
  console.log(uuid);
  var loadEPG = function(){
    ajax(
      {
        url: 'http://'+user+':'+password+'@'+address+':'+port+'/api/epg/events/grid?start=0&limit=50&channel='+uuid,
        type: 'json'
      },
      function(data, status, request) {
        var items = [];
        for (var i = 0; i < data.entries.length; i++) {
          var startDate = new Date(data.entries[i].start*1000);
          var subtitle = ("0"+startDate.getHours()).substr(-2) + ":" + ("0"+startDate.getMinutes()).substr(-2);
          items.push({
            title: data.entries[i].title,
            subtitle: subtitle,
            description: data.entries[i].description
          });
        }
        epgMenu.items(0, items);
        epgMenu.selection(0, 0);
      },
      function(error, status, request) {
        console.log('The ajax request failed: ' + error);
      }
    );
  }
  epgMenu = new UI.Menu({
    highlightBackgroundColor: '#bf00ff',
    sections: [{
      items: [{
        title: 'Loading Data'
      }]
    }]
  });
  epgMenu.on('select', function(e) {
    console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
    console.log('The item is titled "' + e.item.title + '"');
    createDescriptionCard(e.item.title, e.item.description);
  });
  epgMenu.show();
  loadEPG();
}

function createDescriptionCard(title, description){
  cardDescription = new UI.Card({
    title: title,
    body: description,
    scrollable: true,
    titleColor: 'blue',
    bodyColor: 'red'
  });
  cardDescription.show()
}