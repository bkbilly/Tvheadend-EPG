/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');

var channelsMenu;

createChannelsMenu();

function createChannelsMenu() {
  var loadChannels = function(){
    ajax(
      {
        url: 'http://admin:floak13@spinet.asuscomm.com:9981/api/channel/list',
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
        console.log('The ajax request failed: ' + error);
      }
    );
  }

  channelsMenu = new UI.Menu({
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
        url: 'http://admin:floak13@spinet.asuscomm.com:9981/api/epg/events/grid?start=0&limit=50&channel='+uuid,
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
  var card = new UI.Card({
    title: title,
    body: description,
    scrollable: true
  });
  card.show()

}