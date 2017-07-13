var cluster = require('cluster');
var randomstring = require("randomstring");
var redis = require("redis"),
    client = redis.createClient();
var Promise = require('promise');


var num_workers = 4;
var value = randomstring.generate(1024);
var iteraciones = 10000;
var numeroIteracion = 0;
var inicio = new Date();
if (cluster.isWorker) {
  var promiseFunction = function(){
    return new Promise(function (resolve, reject) {
      numeroIteracion++;
      var key = randomstring.generate(24);
      client.set(key,value,function(){
        client.get(key,function(){

          if(numeroIteracion == iteraciones){
            var termino = new Date();
            var ms_usados = (termino - inicio);
            var txr_x_sec = 1000 / ( ms_usados / (iteraciones ) );
            // console.log("Tiempo usado : " + (termino - inicio));
                console.log("Transacciones por seg : " + txr_x_sec);
                console.log("Tiempo medio por transaccion : "+ ( ms_usados / (iteraciones ))+ " ms" );
                console.log("Tiempo usado : "+ ( ms_usados )+ " ms" );
          }
          resolve();
        });
      });
    });
  }
  var arrPromises = [];
  for(var i=0;i<iteraciones;i++){
    arrPromises.push(promiseFunction);
  }

  var chain = Promise.resolve();
  for (var i = 0; i < arrPromises.length; i++) {
    chain = chain.then(arrPromises[i]);
  }

} else {
  // console.log('I am a master');
  for (var i = 0; i < num_workers; i++){
    cluster.fork();
  }
}
