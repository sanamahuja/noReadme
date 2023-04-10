const tablemodel = require("../models/tablemodel");
/**
 * fetch table with appropriate ids
 *controller to get request
 * url '/:id' -id request.params
 * @param {request Object,response object} -req.params.id- table id
 * @returns Object{[2d ARRAY],NUMBER,NUMBER}
 */
const fetchSingleTable = async (req, res) => {
  const id = req.query.id; //to access the id of table to send back
  //fetchOne
  try {
    const data = await tablemodel.findOne({ id: id });
    if (Object.keys(data).length == 0) {
      res.status(404);
    } else {
      res.status(200);
    }

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(404);
  }
};
module.exports = fetchSingleTable;
