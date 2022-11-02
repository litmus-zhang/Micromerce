var seneca = require("seneca")();

var plugin = function (options) {
  var seneca = this;
  //Fetch all product
  seneca.add({ area: "product", action: "fetch" }, function (args, done) {
    var products = this.make("products");

    products.list$({}, done);
  });

  //Fetch product by catergory
  seneca.add(
    { area: "product", action: "fetch", criteria: "byCategory" },
    function (args, done) {
      var products = this.make("products");
      products.list$({ category: args.category }, done);
    }
  );

  //Fetch product by id
  seneca.add(
    { area: "product", action: "fetch", criteria: "byId" },
    function (args, done) {
      var products = this.make("products");
      products.load$(args.id, done);
    }
  );

  // Adds a new product

  seneca.add({ area: "product", action: "add" }, function (args, done) {
    var products = this.make("products");
    const { name, description, price, category } = args;
    products = { name, description, price, category };
    products.save$(function (err, products) {
      done(err, products.data$(false));
    });
  });

  // Removes a product

  seneca.add({ area: "product", action: "remove" }, function (args, done) {
    var products = this.make("products");
    products.remove$(args.id, function (err) {
      done(err, null);
    });
  });

  //Edit a product by id

  seneca.edit({ area: "product", action: "edit" }, function (args, done) {
    seneca.act(
      { area: "product", action: "fetch", criteria: "byId", id: args.id },
      function (err, result) {
        result.data$({
          name: args.name,
          description: args.description,
          price: args.price,
          category: args.category,
        });
        result.save$(function (err, product) {
          done(err, product.data$(false));
        });
      }
    );
  });
};

module.exports = plugin;

var seneca = require("seneca")();
seneca.use(plugin);
seneca.use("mongo-store", {
  name: "seneca",
  host: "127.0.0.1",
  port: 27017,
});

seneca.ready(function (err) {
  seneca.act("role:web", {
    use: {
      prefix: "/products",
      pin: { area: "product", action: "*" },
      map: {
        fetch: { GET: true },
        edit: { PUT: true },
        delete: { GET: false, DELETE: true },
      },
    },
  });
  var express = require("express");
  var app = express();
  app.use(express.json());

  app.use(seneca.export("web"));
  app.listen(3000);
});
