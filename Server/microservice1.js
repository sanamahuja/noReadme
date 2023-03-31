/**
 * Database instance to manipulate
 * @module -"/Server/models/tablemodel"
 * @module -"/Server/models/Usersmodel"
 */
const tablemodel = require("./models/tablemodel");
const UsersModel = require("./models/Usersmodel");

/**
 * Database instance to manipulate
 * @module -"/Server/models/Usersmodel"
 */

const BaseService = require("./Base-Service");

/**
 * util functions import
 */
const createNewTable = require("./MicroService1Utils/createNewTable");
const UpdateTable = require("./MicroService1Utils/UpdateTable");
const fetchAllTableIds = require("./MicroService1Utils/fetchAllTableIds");
const fetchSingleTable = require("./MicroService1Utils/fetchSingleTable");

//passport and local strategy requirement
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
//require env
require("dotenv").config();

/**
 * class runs a microservice with controllers for different routes
 * @class
 * @classdesc BaseService
 */
class ms1 extends BaseService {
  /**
   * calls parent class contructor
   * @constructor
   */
  constructor() {
    super();
  }
  /**
   * Command Line Arguments
   * @param {}
   * @override BaseService class method
   * @memberof microservice1
   * @returns undefined
   */
  cli() {
    //commander args
    this.program = super.cli();
    this.program
      .option("--port <number>", " Give port number", "4000")
      .option(
        "--mongoURL <string>",
        "Give DB connection string",
        `${
          process.env.status == "PRODUCTION"
            ? "mongodb+srv://sanamahuja2000:atlasSanam@cluster0.kzveowp.mongodb.net/tableDb?retryWrites=true&w=majority/"
            : "mongodb://localhost:27017/tabletest"
        }`
      )
      .parse(process.argv);
  }

  //
  passportLocal() {
    //defining strategy to authenticate
    passport.use(
      new LocalStrategy((username, password, done) => {
        console.log(username, password);
        UsersModel.findOne({ username: username }, (err, user) => {
          if (err) {
            console.log("Error in finding user --> Passport");
            return done(err);
          } else if (!user || user.password != password) {
            console.log("Invalid Username/Password");
            return done(null, false);
          }
          return done(null, user);
        });
      })
    );

    //Serializing user session
    passport.serializeUser((user, done) => {
      return done(null, user.id);
    });

    //desiarilzer to accessS
    passport.deserializeUser((id, done) => {
      UsersModel.findById(id, (err, user) => {
        if (err) {
          console.log("Error in finding user --> Passport");
          return done(err);
        }

        return done(null, user);
      });
    });
    // check if the user is authenticated
    passport.checkAuthentication = (req, res, next) => {
      // if the user is signed in, then pass on the request to the next function(controller's action)
      if (req.isAuthenticated()) {
        return next();
      }

      // if the user is not signed in
      res.status(401);
      return res.send("rejected at authentication");
    };
  }

  /**
   * register functions
   */
  registerFn() {
    this.createNewTable = createNewTable;
    this.fetchAllTableIds = fetchAllTableIds;
    this.fetchSingleTable = fetchSingleTable;
    this.UpdateTable = UpdateTable;
  }
  /**
   * Regiser Controllers to Routes by passing referrence
   * @param {}
   * @override BaseService class method
   * @memberof microservice1
   * @returns undefined
   */
  registerMiddleRoutes() {
    this.registerFn();
    super.registerRoutes();

    this.redisConnect();
    this.Router.use(passport.initialize());
    this.Router.use(passport.session());
  }
  authorisedRoutes() {
    const authRouter = this.subrouter();
    authRouter.post(
      "/createNew",
      passport.checkAuthentication,
      this.createNewTable
    ); //register post route '/ '
    authRouter.post(
      "/updateTable",
      passport.checkAuthentication,
      this.UpdateTable
    ); //register post route '/ '  to params id
    authRouter.get(
      "/singleTable",
      passport.checkAuthentication,
      this.fetchSingleTable
    ); //register get route '/ '  to params id
    authRouter.get(
      "/getAllIds",
      passport.checkAuthentication,
      this.fetchAllTableIds
    ); //register get route '/ '
    this.Router.get("/badCredentials", (req, res) =>
      res.send("try again with right credentials")
    );
    this.Router.get("/goodCredentials", (req, res) => {
      res.status(200).send({ success: true });
    });
    authRouter.post(
      "/sign-in",
      passport.authenticate("local", {
        successRedirect: "/goodCredentials",
        failureRedirect: "/badCredentials",
        // session: true,
      })
    );
    authRouter.post("/sign-up", async (req, res) => {
      await UsersModel.create({
        username: req.body.username,
        password: req.body.password,
      });
      res.json({ success: true });
    });
    authRouter.post("/logout", async (req, res, next) => {
      req.logout((err) => {
        if (err) {
          return next(err);
        }
        res.status(200);
        return res.json({ success: true });
      });
    });

    return authRouter;
  }
  registerRoutes() {
    this.registerMiddleRoutes();
    const authRouter = this.authorisedRoutes();
    this.Router.use("/auth", authRouter);
  }

  /**
   * runs microservice
   * @param {number,string} -port - mongoDb URL
   * @override BaseService class method
   */
  start() {
    this.cli();

    const { port, mongoURL } = this.program.opts();
    this.passportLocal();
    this.registerRoutes();
    return super.start(port, mongoURL);
  }
  testStart() {
    this.cli();

    const { port } = this.program.opts();
    this.passportLocal();
    this.registerRoutes();
    return super.startTest(port);
  }
}
let server;
// instance of ms1 starts the express server
if (process.env.status == "PRODUCTION") {
  server = new ms1().start();
} else {
  server = new ms1().testStart();
}

// const testServer = new ms1().testStart();

//catch exceptions
process.on("uncaughtException", (err) => {
  console.error("There was an uncaught error", err);
  process.exit(1); // optional, but recommended in most cases
});

module.exports = server;
