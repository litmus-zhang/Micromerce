var plugin = function (options) {
  var seneca = this;
  var mandrill = require("mandrill-api/mandrill");
  var mandrill_client = new mandrill.Mandrill("XBgaHW7rFMd6Vh-eO6Lqrw");
  mandrill_client.users.info(
    {},
    function (result) {
      console.log(result);
    },
    function (e) {
      console.log("A mandrill error occurred: " + e.name + " - " + e.message);
    }
  );

  //Send email using a template
  seneca.add(
    { area: "email", action: "send", template: "*" },
    function (args, done) {
      //TODO: Implement this
    }
  );

  // Send an email including the content
  seneca.add({ area: "email", action: "send" }, function (args, done) {
    //TODO: Implement this
    console.log(args);
    var message = {
      html: args.content,
      subject: args.subject,
      to: [
        {
          email: args.to,
          name: args.toName,
          type: "to",
        },
      ],
      from_email: "info@micromerce.com",
      from_name: "Micromerce",
    };
    mandrill_client.messages.send(
      { message: message },
      function (result) {
        done(null, { status: result.status });
      },
      function (e) {
        done({ code: e.name }, null);
      }
    );
  });
};
