var bleno = require('bleno');
var util = require('util');
var BlenoCharacteristic = bleno.Characteristic;
var tts;
var ddata = require('./ddata.js');
var json = require('jsonify');

function stringToBytes(string) {
    var array = new Uint8Array(string.length);
    for (var i = 0, l = string.length; i < l; i++) {
       array[i] = string.charCodeAt(i);
    }
    return array;
}

function bytesToString(uintArray) {
    var encodedString = String.fromCharCode.apply(null, uintArray),
        decodedString = decodeURIComponent(escape(encodedString));
    return decodedString;
}

var NameChar = function () {
    bleno.Characteristic.call(this, {
        uuid: '001f',
        properties: ['read', 'write']
    });
    this.ddata = new ddata();
    this.payload = {};
};

util.inherits(NameChar, BlenoCharacteristic);

NameChar.prototype.onReadRequest = function(offset, callback) {
   console.log('incoming request');
   if(!offset) {
       console.log("read success");
      callback(this.RESULT_SUCCESS, Buffer.from(stringToBytes(json.stringify(this.payload))));
   } else {
    console.log("read fail");
      callback(this.RESULT_INVALID_ATTRIBUTE_LENGTH);
}
   console.log('NameChar - Read: value = ' + this.payload);
  
};

NameChar.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
    console.log("recieved " + data);
    var recieved = bytesToString(data);
    var stuff = json.parse(recieved);
    if (stuff.key == "data") {
        stuff = stuff.payload;
        this.payload = stuff;
        var i = 0;
        bleno.stopAdvertising();
        bleno.startAdvertising(stuff[0].text, ['9f97d296-442a-4e30-8209-b2f71753ffae']);
        this.ddata.displayd = '<div class="render" style="background-color: ' + stuff[stuff.length - 1].bg.bgcol + '; border-color: ' + stuff[stuff.length - 1].bg.bdcol + '; border-width: ' + stuff[stuff.length - 1].bg.bdsize + '">';
        for(i = 0; i < stuff.length - 1; i++) {
            this.ddata.displayd += "<div class='nline'><div style='display: table-cell; width: 100%; text-align: " + stuff[i].align + "; vertical-align: " + stuff[i].valign + "; color: " + stuff[i].color + "; font-size: " + stuff[i].size + "px;'>" + stuff[i].text + "</div></div>";
        }
        this.ddata.displayd += "</div>";
        callback(this.RESULT_SUCCESS);
    }
}

module.exports = NameChar;