var cluster = require('cluster');
var randomstring = require("randomstring");
var Promise = require('promise');
// Connection URL
var url = 'mongodb://mongouser:asdf87J43hkj@localhost/simplygeocoding';

var num_workers = 4;
var value = randomstring.generate(1024);
var iteraciones = 10000;
var numeroIteracion = 0;
var inicio = new Date();
if (cluster.isWorker) {

  var mysql      = require('mysql');
  var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'napsis123',
    database : 'benchmarking'
  });

  connection.connect();
  var promiseFunction = function(){
    return new Promise(function (resolve, reject) {
      numeroIteracion++;
      var key = randomstring.generate(32);

      connection.query('INSERT INTO data SET ?', {"key":key, "val": value }, function (error, results, fields) {
        var query = connection.query('SELECT * FROM data where ?',{ key : key});

        query
          .on('error',function(err){
            console.log(err);
          })
          .on('result', function(row) {
            // Pausing the connnection is useful if your processing involves I/O
            if(numeroIteracion == iteraciones){
              var termino = new Date();
              var ms_usados = (termino - inicio);
              var txr_x_sec = 1000 / ( ms_usados / (iteraciones ) );
              // console.log("Tiempo usado : " + (termino - inicio));
              console.log("Transacciones por seg : " + txr_x_sec);
              // console.log("Tiempo medio por transaccion : "+ ( ms_usados / (iteraciones ))+ " ms" );
              // console.log("Tiempo usado : "+ ( ms_usados )+ " ms" );
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


