const tablemodel = require("../models/tablemodel");
/**
 * updated reponse
 *controller to post request
 * url '/:id' -id request.params
 *@param {request Object,response object} req.params.id-  table id
 *@returns Object -{[2D Array,number,number]}
 */
const UpdateTable = async (req, res) => {
  try {
    const [table, row, col, idToUpdate] = req.body;

    const dataToPost = JSON.stringify([table, row, col]);
    const result = await tablemodel.updateOne(
      { id: idToUpdate },
      { data: dataToPost }
    );

    if (result.matchedCount == 0) {
      res.status(404);
    } else {
      res.status(200);
    }
    res.json(result);
  } catch (error) {
    console.log("Error", error);
  }
};
module.exports = UpdateTable;
