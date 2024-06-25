const routerName = "no-permission";
const renderName = `backend/page/${routerName}/`;

module.exports = {
  getNoPermission: async (req, res, next) => {
    res.render(`${renderName}list`);
  },
};
