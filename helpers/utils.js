let createFilterStatus = async (
  currentStatus,
  collectionModel,
  categoryFilter = "",
  groupFilter = "",
) => {
  let statusFilter = [
    {
      name: "ALl",
      value: "all",
      count: 3,
      link: "#",
      class: "btn-outline-secondary",
    },
    {
      name: "ACTIVE",
      value: "active",
      count: 4,
      link: "#",
      class: "btn-outline-secondary",
    },
    {
      name: "INACTIVE",
      value: "inactive",
      count: 2,
      link: "#",
      class: "btn-outline-secondary",
    },
  ];

  for (let index = 0; index < statusFilter.length; index++) {
    let value = statusFilter[index];
    let condition = value.value !== "all" ? { status: value.value } : {};
    if (value.value === currentStatus) {
      value.class = "btn-success";
    }
    if (categoryFilter !== "") {
      condition.id_category = { $in: categoryFilter };
    }
    if (groupFilter !== "") {
      condition.id_group_category = { $in: groupFilter };
    }
    await collectionModel.count(condition).then((data) => {
      statusFilter[index].count = data;
    });
  }
  return statusFilter;
};

module.exports = {
  createFilterStatus: createFilterStatus,
};
