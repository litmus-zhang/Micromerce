var express = require("express");
var bodyParser = require("body-parser");
const senecaEmailer = seneca.client({
  type: "tcp",
  port: 9000,
  host: "192.168.0.2",
});
const senecaProductManage = seneca.client({
  type: "tcp",
  port: 9000,
  host: "192.168.0.3",
});
const senecaOrderProcessor = seneca.client({
  type: "tcp",
  port: 9000,
  host: "192.168.0.4",
});

function api(options) {
  var seneca = this;

  // Fetch all products
  seneca.add({ area: "ui", action: "products" }, function (args, done) {
    //TODO: Implement this
    senecaProductManage.act(
      { area: "product", action: "fetch" },
      function (err, result) {
        done(err, result);
      }
    );
  });

  // Fetch a product by id
  seneca.add({ area: "ui", action: "productbyid" }, function (args, done) {
    //TODO: Implement this
    senecaProductManage.act(
      { area: "product", action: "fetch", criteria: "byId", id: args.id },
      function (err, result) {
        done(err, result);
      }
    );
  });
  // Create an order
  seneca.add({area: "ui", action: "createorder"}, function(args, 
    done) {
    senecaProductManage.act({area: "product", action: "fetch", 
    criteria: "byId", id: args.id}, function(err, product) {
    if(err) done(err, null);
    senecaOrderProcessor.act(area: "orders", action: "create", 
    products: [product], email: args.email, name: args.name, 
    function(err, order) {
    done(err, order);
    });
    })
});
  this.add("init:api", function (msg, respond) {
    seneca.act(
      "role:web",
      {
        use: {
          prefix: "/api",
          pin: { area: "ui", action: "*" },
          map: {
            products: { GET: true },
            productbyid: { GET: true, suffix: "/:id" },
            createorder: { POST: true },
          },
        },
      },
      respond
    );
  });
}

module.exports = api;
var seneca = require("seneca")();
seneca.use(api);

var app = express();
app.use(bodyParser.json());
app.use(seneca.export("web"));
app.listen(3000);
