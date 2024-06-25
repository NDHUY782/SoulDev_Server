let GetRss = (items) => {
  let newData = data.items.map((item) => {
    let content = item.content;
    item.content = content.match(/<img([\w\W]+?)>/g)[0];
    return item;
  });
  return 0;
};

module.exports = {
  GetRss,
};
