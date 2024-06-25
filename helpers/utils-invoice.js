let createFilterStatusInvoice = async (
  currentStatus,
  collectionModel,
  categoryFilter = "",
  groupFilter = "",
) => {
  let statusFilter = [
    { name: "ALl", value: "all", count: 3, link: "#", class: "btn-secondary" },
    {
      name: "Chờ lấy Hàng",
      value: "cho-lay-hang",
      count: 4,
      link: "#",
      class: "btn-info",
    },
    {
      name: "Vận Chuyển",
      value: "van-chuyen",
      count: 8,
      link: "#",
      class: "btn-primary",
    },
    {
      name: "Hoàn Thành",
      value: "hoan-thanh",
      count: 7,
      link: "#",
      class: "btn-success",
    },
    {
      name: "Đã Hủy",
      value: "da-huy",
      count: 5,
      link: "#",
      class: "btn-danger",
    },
  ];

  for (let index = 0; index < statusFilter.length; index++) {
    let value = statusFilter[index];
    let condition = value.value !== "all" ? { status: value.value } : {};
    if (value.value === currentStatus) {
      value.class = "btn-success";
    }
    await collectionModel.count(condition).then((data) => {
      statusFilter[index].count = data;
    });
  }
  return statusFilter;
};

module.exports = {
  createFilterStatusInvoice: createFilterStatusInvoice,
};
