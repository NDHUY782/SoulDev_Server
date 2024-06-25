const MenuService = require(`${__path_services}backend/menu_service`);
const SettingService = require(`${__path_services}backend/setting_service`);
const CategoryService = require(`${__path_services}backend/category_service`);
const CategoryProductService = require(
  `${__path_services}backend/category_product_service`,
);

module.exports = {
  getMenu: async (req) => {
    let getMenu = await MenuService.show_frontend();
    return getMenu;
  },

  getSetting: async (req) => {
    let getSetting = await SettingService.show_frontend();
    return getSetting;
  },

  getCategory: async (req) => {
    let getCategory = await CategoryService.show_frontend();
    return getCategory;
  },

  getProductCategory: async (req) => {
    let getProductCategory = await CategoryProductService.show_frontend();
    return getProductCategory;
  },
};
