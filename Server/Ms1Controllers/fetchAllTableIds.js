const tablemodel = require("../models/tablemodel");
/**
 * fetch all table ids
 *controller to get request
 * url '/'
 *@param {request Object,response object}
 *@returns Object-{[1-d INTEGER ARRAY]}
 */
const fetchAllTableIds = async (req, res) => {
  //fetchall
  try {
    const data = await tablemodel.find({}).select("id");
    res.status(200);
    res.json(data);
  } catch (error) {
    console.log(error);
  }
};
module.exports = fetchAllTableIds;
