const tablemodel = require("../models/tablemodel");
/**
 * Creates new entry in Database
 * controller to post request
 * url '/'
 * @param {request Object,response object} req.params.id-  table id
 * @returns Object-{[2D Array,number,number]}
 */
const createNewTable = async (req, res) => {
  //id to send data with in db
  try {
    const [table, row, col, lastId] = req.body; //destructing request body
    const dataToPost = JSON.stringify([table, row, col]);
    const UniqueId = lastId + 1;
    const result = await tablemodel.create({
      id: UniqueId,
      data: dataToPost,
    });
    res.status(200);
    res.json(result);
  } catch (error) {
    console.log("Error", error);
  }
};
module.exports = createNewTable;
