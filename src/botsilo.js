
/**
 * Bot constructor
 *
 * @param  {String}   botId         description
 * @param  {String}   secret        description
 * @param  {Function} on_connect    description
 * @param  {Function} on_disconnect description
 * @param  {Function} on_message    description
 */
function Bot(host, port, botId, secret, on_connect, on_disconnect, on_message) {
  var botId = botId;
  var secret = secret;
  var on_disconnect = on_disconnect;
  var on_connect = on_connect;
  var on_message = on_message;
  var client = false;

  console.log(botId, secret);

  var mqttStart = function() {
    // Create a client instance
    //client = new Paho.MQTT.Client("54.243.3.185", 1883, botId);
    client = new Paho.MQTT.Client(host, port, botId);

    // set callback handlers
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    var options = {
      useSSL: false,
      userName: botId,
      password: secret,
      onSuccess: onConnect,
      onFailure: doFail
    }

    // connect the client
    client.connect(options);

    // called when the client connects
    function onConnect() {
       client.subscribe("client/" + botId);
       on_connect();
    }

    function doFail(e) {
      alert("Unable to connect to Botsilo");
      on_disconnect();
    }

    // called when the client loses its connection
    function onConnectionLost(responseObject) {
      if (responseObject.errorCode !== 0) {
        //console.log("onConnectionLost:"+responseObject.errorMessage);
        on_disconnect();
      }
    }

    // called when a message arrives
    function onMessageArrived(message) {
      var obj = JSON.parse(message.payloadString);
      console.log(obj);
      console.log(obj['from'], obj['payload']);
      on_message(obj['from'], obj['payload']);
    }
  };

  /**
   * start - start the bot
   */
  this.start = function () {
    mqttStart();
  }

  /**
   * stop - disconnect from Toby
   */
  this.stop = function() {
    client.disconnect();
  }

  /**
   * send - send a message
   *
   * @param  {Object} payload the message payload
   * @param  {Array} tags    list of tags
   * @param  {String} ack    the ack tag
   */
  this.send = function (to, payload) {
    var request = new Paho.MQTT.Message(JSON.stringify({payload: payload, to: to}));
    request.destinationName = "server/" + botId + "/send";
    client.send(request);
  }

  /**
   * info - get bot information
   *
   * @param  {String} ack  the ack tag
   */
  this.info = function() {
    var request = new Paho.MQTT.Message(JSON.stringify({}));
    request.destinationName = "server/" + botId + "/info";
    client.send(request);
  }

  /**
   * info - get bot information
   *
   * @param  {String} ack  the ack tag
   */
  this.add = function(id) {
    var request = new Paho.MQTT.Message(JSON.stringify({id:id}));
    request.destinationName = "server/" + botId + "/add";
    client.send(request);
  }

  /**
   * info - get bot information
   *
   * @param  {String} ack  the ack tag
   */
  this.remove = function(id) {
    var request = new Paho.MQTT.Message(JSON.stringify({id:id}));
    request.destinationName = "server/" + botId + "/remove";
    client.send(request);
  }

  /**
   * info - get bot information
   *
   * @param  {String} ack  the ack tag
   */
  this.kill = function(sk) {
    var request = new Paho.MQTT.Message(JSON.stringify({sk:sk}));
    request.destinationName = "server/" + botId + "/kill";
    client.send(request);
  }

  /**
   * info - get bot information
   *
   * @param  {String} ack  the ack tag
   */
  this.change = function(oldSk, newSk) {
    var request = new Paho.MQTT.Message(JSON.stringify({oldSk: oldSk, newSk: newSk}));
    request.destinationName = "server/" + botId + "/change";
    client.send(request);
  }

  /**
   * create - create bot
   *
   * @param  {String} id
   * @param  {String} sk
   */
  this.create = function(id, sk) {
    var request = new Paho.MQTT.Message(JSON.stringify({id:id, sk:sk}));
    request.destinationName = "server/" + botId + "/create";
    client.send(request);
  }

}


/** ------------------------- Helper Methods ------------------------------- **/

/**
* isArray - check if valid array
*
* @param  {Array} a the value to test
* @return {boolean}  returns true if parameter is an array, false otherwise
*/
function isArray(a) {
  return Array.isArray(a)
}

/**
 * isString - check if valid string
 *
 * @param  {String} s the value to test
 * @return {boolean}  returns true if parameter is string, false otherwise
 */
function isString(s) {
  return (typeof s === 'string' || s instanceof String);
}

/**
* isString - check if valid string
*
* @param  {boolean} b the value to test
* @return {boolean}  returns true if parameter is boolean, false otherwise
*/
function isBoolean(b) {
  return typeof(b) === "boolean";
}

/**
 * isString - check if valid string
 *
 * @param  {String} s the value to test
 * @return {boolean}  returns true if parameter is string, false otherwise
 */
function isString(s) {
  return (typeof s === 'string' || s instanceof String);
}

/**
 * isJsonObject - description
 *
 * @param  {type} obj description
 * @return {type}     description
 */
function isJsonObject(obj) {
  return isJsonString(JSON.stringify(obj));
}

/**
 * isJsonString - check if string is valid json
 *
 * @param  {String} jsonString the string to check
 * @return {boolean}           true if valid json, false otherwise
 */
function isJsonString(jsonString) {
    try {
        var o = JSON.parse(jsonString);
        if (o && typeof o === "object") {
            return true;
        }
    }
    catch (e) { }

    return false;
};
