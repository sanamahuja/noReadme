const express = require("express");
const mongoose = require("mongoose");
const { Command } = require("commander");
const Router = express.Router();
const cors = require("cors");
const redis = require("redis");
const session = require("express-session");
const MongoMemoryServer = require("mongodb-memory-server").MongoMemoryServer;

class BaseService {
  cli() {
    return new Command();
  }
  subrouter() {
    return express.Router();
  }
  connectDb(mongoURL) {
    try {
      mongoose.set("strictQuery", true);
      mongoose.connect(mongoURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      const con = mongoose.connection;
      con.on("open", (stream) => console.log(stream, "open connect"));
      con.on("connect", (stream) => console.log(stream, "connection connect"));
    } catch (error) {
      console.log("error in db connection");
      return;
    }
    console.log("Succesfullly connected to database");
  }
  registerRoutes() {
    this.Router = Router;
    this.Router.use(
      cors({
        origin: [
          "http://localhost:3000",
          "http://localhost:3001",
          "http://localhost:4000",
        ],
        credentials: true,
      })
    );
    this.Router.use(express.json());
    this.Router.use(express.urlencoded({ extended: true }));
  }
  async testMemoryServerConnect() {
    // This will create an new instance of "MongoMemoryServer" and automatically start it
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoose.set("strictQuery", true);
    await mongoose.connect(uri);

    this.Router.use(
      session({
        secret: "something",
        saveUninitialized: true,
        resave: true,
        cookie: {
          maxAge: 1000 * 60 * 100,
        },
      })
    );
  }
  redisConnect() {
    const RedisStore = require("connect-redis").default;

    //Configure redis client
    const redisClient = redis.createClient({
      host: "127.0.0.1",
      port: 6379,
    });

    redisClient.connect();
    this.Router.use(
      session({
        secret: "something",
        saveUninitialized: false,
        resave: false,
        store: new RedisStore({ client: redisClient }),
        cookie: {
          // sameSite: "none",
          maxAge: 1000 * 60 * 100,
        },
      })
    );
  }
  startTest(port) {
    this.app = express();
    this.app.use("/", this.Router);
    // this.redisConnect();
    this.testMemoryServerConnect();
    return this.app.listen(port, (err) => {
      if (err) {
        console.log("Error while listening ", err);
        return;
      }
      console.log("Server is up and running at port : ", port);
    });
  }

  start(port, mongoURL) {
    this.app = express();
    this.app.use("/", this.Router);
    this.connectDb(mongoURL);
    return this.app.listen(port, (err) => {
      if (err) {
        console.log("Error while listening ", err);
        return;
      }
      console.log("Server is up and running at port : ", port);
    });
  }
}

module.exports = BaseService;
