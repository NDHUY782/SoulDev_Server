"use strict";
const crypto = require("crypto");
const PhoneNumber = require("awesome-phonenumber");
const Validator = require("validator");
const Customer = require("../models/Customer");
// const joiningRequestSchema = require('../modules/joiningrequest/joiningRequestSchema');
const moment = require("moment");
const otherHelper = {};
const path = require("path");
const validateUrl = require("valid-url");

otherHelper.mongoIdExistInArray = (mongodbIdArray, mongoDbId) => {
  for (let i = 0; i < mongodbIdArray.length; i++) {
    if (mongodbIdArray[i].toString() === mongoDbId.toString()) return true;
  }
  return false;
};

otherHelper.validateUrl = (url) => {
  const isValid = validateUrl.isUri(url);
  if (!isValid) return false;
  return true;
};

// otherHelper.checkprocess = (link) => {

otherHelper.generateRandomHexString = (len) => {
  return crypto
    .randomBytes(Math.ceil(len / 2))
    .toString("hex") // convert to hexadecimal format
    .slice(0, len)
    .toUpperCase(); // return required number of characters
};
otherHelper.generateRandomNumberString = (len) => {
  return Math.floor(Math.random() * 8999 + 1000);
};
otherHelper.mongoIdExistInArray = (mongodbIdArray, mongoDbId) => {
  if (mongodbIdArray) {
  } else {
    mongodbIdArray = [];
  }
  for (let i = 0; i < mongodbIdArray.length; i++) {
    if (mongodbIdArray[i].toString() === mongoDbId.toString()) return true;
  }
  return false;
};
otherHelper.parsePhoneNo = (phone, RegionCode) => {
  try {
    var pn = new PhoneNumber(phone, RegionCode);
    if (!pn.isValid()) {
      return {
        status: false,
        data: "Provided no is invalid mobile no.",
      };
    } else if (!pn.isMobile()) {
      return {
        status: false,
        data: "Provided no should be mobile no.",
      };
    } else if (pn.isValid()) {
      return {
        status: true,
        data: pn.getNumber("e164"),
      };
    } else {
      return {
        status: true,
        data: pn.getNumber("e164"),
      };
    }
  } catch (err) {
    return err;
  }
};

otherHelper.parseFilters = (req, defaults, is_deleted) => {
  const size_default = defaults ? defaults : 10;
  let page;
  let size;
  let sortQuery = { _id: -1 };
  let sort_key;
  let searchQuery = {};
  let populate = [];
  let selectQuery = { __v: 0 };
  if (is_deleted === undefined) {
  } else if (is_deleted === null) {
  } else {
    if (!isNaN(is_deleted)) {
      searchQuery = { ...searchQuery, is_deleted: is_deleted };
      selectQuery = {
        ...selectQuery,
        is_deleted: 0,
        deleted_at: 0,
        deleted_by: 0,
      };
    }
  }
  if (req.query.page && !isNaN(req.query.page) && req.query.page != 0) {
    page = Math.abs(req.query.page);
  } else {
    page = 1;
  }
  if (req.query.size && !isNaN(req.query.size) && req.query.size != 0) {
    size = Math.abs(req.query.size);
  } else {
    size = size_default;
  }
  if (req.query.sort) {
    let sortField = req.query.sort.slice(1);
    let sortBy = req.query.sort.charAt(0);
    if (sortBy == 1 && !isNaN(sortBy) && sortField) {
      //one is ascending
      sortQuery = sortField;
    } else if (sortBy == 0 && !isNaN(sortBy) && sortField) {
      //zero is descending
      sortQuery = "-" + sortField;
    } else {
      sortQuery = "";
    }
  }
  return { page, size, sortQuery, searchQuery, selectQuery, populate };
};

otherHelper.sendResponse = (res, status, success, data, errors, msg, token) => {
  const response = {};
  if (success !== null) response.success = success;
  if (data !== null) response.data = data;
  if (errors !== null) response.errors = errors;
  if (msg !== null) response.msg = msg;
  if (token !== null) response.token = token;
  return res.status(status).json(response);
};
otherHelper.paginationSendResponse = (
  res,
  status,
  success,
  data,
  msg,
  pageNo,
  pagesize,
  totalData,
) => {
  const response = {};
  if (data) response.data = data;
  if (success !== null) response.success = success;
  if (msg) response.msg = msg;
  if (pageNo) response.page = pageNo;
  if (pagesize) response.size = pagesize;
  if (typeof totalData === "number") response.totalData = totalData;
  return res.status(status).json(response);
};
otherHelper.getQuerySendResponse = async (
  model,
  page,
  size,
  sortQuery,
  searchQuery,
  selectQuery,
  next,
  populate,
) => {
  let pulledData = {};
  try {
    pulledData.data = await model
      .find(searchQuery)
      .select(selectQuery)
      .sort(sortQuery)
      .skip((page - 1) * size)
      .limit(size * 1)
      .populate(populate);
    pulledData.totalData = await model.countDocuments(searchQuery);
    return pulledData;
  } catch (err) {
    next(err);
  }
};
otherHelper.returnIdIfSlug = async (slug_url, slug_key, schema) => {
  if (Validator.isMongoId(slug_url)) {
    return slug_url;
  } else {
    const filter = { [slug_key]: slug_url.toLowerCase(), is_deleted: false };
    const d = await schema.findOne(filter).select({ _id: 1 });
    if (d) {
      return d._id;
    } else {
      return null;
    }
  }
};
otherHelper.slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
};
otherHelper.regexp = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\/^$|#]/g, ""); // Remove all non-word chars
};
otherHelper.removeUnicode = (str) => {
  // bo dau tieng viet
  if (!str) return str;
  str = str + ``;
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  // str = str.replace('(', '-');
  // str = str.replace(')', '-');
  return str.trim();
};
otherHelper.sortObjectEncode = (obj) => {
  var sorted = {};
  var str = [];
  var key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
};

otherHelper.sortObject = (o) => {
  var sorted = {},
    key,
    a = [];

  for (key in o) {
    if (o.hasOwnProperty(key)) {
      a.push(key);
    }
  }

  a.sort();

  for (key = 0; key < a.length; key++) {
    sorted[a[key]] = o[a[key]];
  }
  return sorted;
};

otherHelper.isArrayEqual = (a, b) => {
  if (a.length != b.length) return false;
  if (a.some((oa) => !b.find((ob) => oa.label == ob.label))) return false;
  return true;
};

otherHelper.getImageUrl = (imageUrl = "") => {
  // let url = urls[process.env.NEXT_PUBLIC_APP_ENV];
  if (imageUrl) {
    return process.env.IMAGE_URL + "/" + otherHelper.encodeImageURL(imageUrl);
  }
  return "";
};

otherHelper.encodeImageURL = (imageUrl) => {
  const tmp = imageUrl.replace(/\\/g, "/");
  const basename = path.basename(tmp);
  const dirname = path.dirname(tmp);
  return `${dirname}/${encodeURIComponent(basename)}`;
};

otherHelper.sanitizePhone = (phone) => {
  if (phone) {
    // Remove all whitespace characters
    phone = phone.replace(/\s/g, "");

    // Check if the phone number starts with '084' (special case)
    const isSpecial = phone.startsWith("084");

    // Check if the phone number starts with '+84' or '84'
    if (!phone.startsWith("+84") && !phone.startsWith("84")) {
      // Normalize the phone number to start with '+84'
      phone = "+84" + phone.replace("+84", "");

      // Replace '+840' with '+84'
      phone = phone.replace("+840", "+84");

      // Remove any additional occurrences of '+8484' (if not a special case)
      if (!isSpecial) {
        phone = phone.replace("+8484", "+84");
      }
    }

    // If the phone number doesn't start with '+84' or '84' and doesn't have a leading zero, add the leading zero
    if (
      !phone.startsWith("+84") &&
      !phone.startsWith("84") &&
      !phone.startsWith("0")
    ) {
      phone = "0" + phone;
    }

    // If the phone number starts with '+84 0', remove the extra space after the country code
    phone = phone.replace("+84 0", "+84 ");

    // If the phone number starts with '+840', replace it with '+84'
    phone = phone.replace("+840", "+84");

    // If the phone number starts with '84', prepend the '+' sign
    if (phone.startsWith("84")) {
      phone = "+" + phone;
    }
  }

  return phone;
};

otherHelper.sanitizeEmail = (email) => {
  if (email) {
    email = email.trim();
    email = email.toLowerCase();

    // Remove dots from email address
    const emailWithoutDots = email.replace(/\./g, "");

    // Generate possible variations
    const variations = [
      email,
      emailWithoutDots,
      emailWithoutDots.toLowerCase(),
      emailWithoutDots.toUpperCase(),
    ];

    return variations;
  }

  return [];
};

// otherHelper.getBusyPoint = async ({ doingRequests, doneRequests }) => {
//   const MAX_BUSY_POINT = 100;
//   let mapDoingRequests = null;
//   let mapDoneRequests = null;

//   const maxDoingRequests = await joiningRequestSchema.countDocuments({ status: 'NEW' });
//   const maxDoneRequests = await joiningRequestSchema.countDocuments({
//     status: { $ne: 'NEW' },
//     added_at: { $gte: moment().subtract(10, 'minutes') },
//   });

//   if(maxDoingRequests === 0) {
//     mapDoingRequests = 0;
//   } else {
//     mapDoingRequests = doingRequests * MAX_BUSY_POINT / maxDoingRequests;
//   }

//   if(maxDoneRequests === 0) {
//     mapDoneRequests = 0;
//   } else {
//     mapDoneRequests = doneRequests * MAX_BUSY_POINT / maxDoneRequests;
//   }

//   const calculation = mapDoingRequests + mapDoneRequests;
//   console.log('calculation', doingRequests, doneRequests, calculation);
//   return calculation;
// };
otherHelper.sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

otherHelper.formatVND = (value = 0) => {
  try {
    if (!value) return "";
    return `${value.toString().replace(/(.)(?=(\d{3})+$)/g, "$1,")}đ`;
  } catch (ex) {}
  return value;
};

otherHelper.output = (array) => {
  return "[" + array.map((e) => e.toString().padStart(2, " ")).join(", ") + "]";
};

otherHelper.dequy = (c, c1, dupIndex, log) => {
  log && console.log("---------------------------------------------");
  log &&
    console.log(
      `- STEP ${cnt++} - dupIndex: ${dupIndex} - value: ${c1[dupIndex]}`,
    );
  log && console.log("input :", otherHelper.output(c));
  log && console.log("output:", otherHelper.output(c1));
  // tim tat ca duplicate tru vi tri index
  let dup = [];
  for (let i = 0; i < c1.length; i++) {
    if (i != dupIndex && c1[i] == c1[dupIndex]) {
      c1[i]++;
      dup.push({
        dupIndex: i,
        org: c[i],
      });
    }
  }

  // sort theo uu tien gia tri goc trong mang c truoc; sau do den duong di, duong ve
  dup.sort((a, b) => {
    let flag = a.org - b.org;
    if (flag == 0) {
      // so duong di, duong ve
      flag = Math.floor(a.dupIndex / 9) - Math.floor(b.dupIndex / 9);
    }
    return flag;
  });

  log && console.log("dup array", dup);
  for (let i = 0; i < dup.length; i++) {
    otherHelper.dequy(c, c1, dup[i].dupIndex, log);
  }
};

otherHelper.fixMissingValue = (c, c1, log) => {
  const array = Array(18)
    .fill()
    .map((e, index) => index + 1);
  let flagStop = false;
  while (!flagStop) {
    let missing = array.filter((e) => !c.includes(e));
    log &&
      console.log(
        "missing",
        otherHelper.output(c),
        otherHelper.output(missing),
      );
    flagStop = true;
    missing.forEach((missingVal) => {
      // tim vi tri lon hon va gan missing dau tien de gan lai gia tri missing
      let nearestIndex = -1;
      let nearest = 100;
      c.forEach((cVal, index) => {
        if (cVal - missingVal > 0 && cVal - missingVal < nearest) {
          nearest = cVal - missingVal;
          nearestIndex = index;
        }
      });
      if (nearestIndex >= 0) {
        c[nearestIndex] = missingVal;
        flagStop = false;
      }
    });
  }
};

otherHelper.sortUniqueIndex = (c, log = false) => {
  // chi remove index neu 18 ho, con khong thi ko xu ly gi
  if (c.length < 18) return c;
  let c1 = [...c];
  otherHelper.fixMissingValue(c, c1, log);
  log && console.log("fix missing", otherHelper.output(c1));
  for (let i = 0; i < c1.length - 1; i++) {
    // console.log('==================')
    log && console.log("start from ", i);
    // tim vi tri duplicate dau tien
    for (let j = i + 1; j < c1.length; j++) {
      if (c1[j] == c1[i]) {
        log && console.log("find first dup", i);
        c1[j]++;
        // chay de quy tu vi tri index
        otherHelper.dequy(c, c1, j, log);
      }
    }
  }
  return c1;
};
otherHelper.isHash = (value) => {
  return ["$2a$", "$2b$"].includes(value?.slice(0, 4)) && value?.length >= 59;
};

otherHelper.createGroupName = (members) => {
  let groupName = "";

  if (members?.length > 3) {
    groupName =
      members
        ?.slice(0, 3)
        ?.map((item) => item?.name)
        ?.reverse()
        ?.join(", ") + `${members?.length - 3} ${"others"}`;
  } else {
    groupName = members
      ?.map((item) => item?.name)
      ?.reverse()
      ?.join(", ");
  }

  return groupName;
};

module.exports = otherHelper;
