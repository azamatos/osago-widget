let currentPage = 1;
const datePickerStyle = {
  fontSize: 14.5,
};

const carData = {};
const carBrands = [];
const policyHolder = {};
const policyOwner = {};
var drivers = [];

const baseUrl = "https://polis.sale/widget/osago";

const resultFunction = function (data) {
  const result = JSON.parse(data);
  result?.map((elem) => {
    carBrands.push({ value: elem.data, name: elem.value });
  });
};

ajaxGetRequest(`${baseUrl}/brands`, resultFunction);

$(function () {
  //required libs
  $("head").append('<script src="./inputmask.min.js"></script>');
  $("head").append(
    '<link rel="stylesheet" href="./assets/style.css" type="text/css" />'
  );
  $("head").append(
    '<link rel="stylesheet" href="./jquery-ui-1.13.2.custom/jquery-ui.min.css">'
  );
  $("head").append(
    '<script src="./jquery-ui-1.13.2.custom/jquery-ui.min.js"></script>'
  );
  $("#osago_widget").append(globalContainer);
  $(".global_container").append(navigationBlock);
  $(".global_container").append(block_1);
  $(".global_container").append(block_2);
  $(".global_container").append(block_3);
  $(".global_container").append(block_4);
  $(".global_container").append(block_5);
  $(".global_container").append(block_6);

  // setting polis_start_date
  const fourDays = getAddedDaysDate(4);

  $("#policy_date").val(`${fourDays}`);

  // Mask logic
  Inputmask({ mask: "A 999 AA 999" }).mask($(".car_code_input"));
  Inputmask({ mask: "99.99.9999 г." }).mask($(".datepicker"));
  Inputmask({ mask: "99** 999999" }).mask($(".doc_series_number"));
  Inputmask({ mask: "999-999" }).mask($(".section_code"));
  Inputmask({ mask: "+7 (999) 999-99-99" }).mask($(".phone_number"));
  Inputmask({ mask: "9999 999999" }).mask($(".pass_series_number"));
  Inputmask({
    mask: "*****************",
    definitions: {
      "*": { validator: "[А-ЯA-za-zа-я0-9]", casing: "upper" },
    },
  }).mask($(".id_number"));

  // datepicker for calendar inputs
  $(".datepicker").datepicker({
    showButtonPanel: false,
    dateFormat: "dd.mm.yy г.",
    beforeShow: function (input, inst) {
      $(".ui-datepicker").css(datePickerStyle);
      return undefined;
    },
  });

  $(".calendar").on("click", function () {
    $("#datepicker").trigger("focus");
  });

  // first list onClick button event
  $("#calculate_btn").on("click", calculateCarCode);

  // vin and document selector onChange event to change label
  $("#document_type").on("change", function (event) {
    const { value } = event.target;
    switch (value) {
      case "sts":
        $("#doc_series_number_label").text("Серия и номер СТС");
        $("#doc_date_issue_label").text("Дата выдачи СТС");
        break;
      case "epts":
        $("#doc_series_number_label").text("Серия и номер ЭПТС");
        $("#doc_date_issue_label").text("Дата выдачи ЭПТС");
        break;
      case "pts":
        $("#doc_series_number_label").text("Серия и номер ПТС");
        $("#doc_date_issue_label").text("Дата выдачи ПТС");
        break;
    }
  });

  $("#id_type").on("change", function (event) {
    const { value } = event.target;
    switch (value) {
      case "vin":
        $("#id_number_label").text("Номер ВИН");
        break;
      case "body":
        $("#id_number_label").text("Номер кузова");
        break;
      case "chassis":
        $("#id_number_label").text("Номер шасси");
        break;
    }
  });
  // setting full width for address block

  const windowWidth = window.screen.width;
  const oneGrid = 589;
  const twoGrid = 849;
  const paddings = (windowWidth - 500) / 2 + 35;
  const one = windowWidth <= oneGrid && 250;
  const two =
    windowWidth >= oneGrid && windowWidth <= twoGrid && windowWidth - paddings;
  const three = windowWidth >= twoGrid && 800;
  const fullWidthStyle = {
    width: one || two || three,
    backgroundPositionX: "95%",
  };
  $(".full_width").css(fullWidthStyle);

  // debounce logic with onChange

  const holder = "#holder_address";
  const holderList = "#holder_dropdown";
  const owner = "#owner_address";
  const ownerList = "#owner_dropdown";
  const brand = "#car_brand";
  const brandList = "#brand_dropdown";

  brandChange(brand, brandList);

  $(holder).on("keyup", function (e) {
    debounceOnAddressChange(e, holder, holderList);
  });
  $(owner).on("keyup", function (e) {
    debounceOnAddressChange(e, owner, ownerList);
  });

  // navigation through all pages

  if (currentPage == 1) {
    $(".navigation_block").css("display", "none");
  }

  for (let i = 1; i <= 6; i++) {
    const navElement = `#nav_${i}`;
    $(navElement).on("click", function (event) {
      $(`.global_container`)
        .children()
        .not(navElement)
        .not(".navigation_block")
        .fadeOut(300);
      $(`#list_${i}`).fadeIn(300);
      $(navElement).css("border-bottom", "2px solid var(--primar-color)");
      $(".navigation_block").children().not(navElement).css("border", "none");
    });

    $(`#back_${i}`).on("click", function (event) {
      // show previous list
      toggleList(i, i - 1);
      // using as state for current page
      navigate_page(i - 1);
    });
  }

  $("#next_1").on("click", function (event) {
    toggleList(1, 2);

    navigate_page(2);
  });

  // list 2 data save

  $("#next_2").on("click", function (event) {
    carData.policyDate = $("#policy_date").val();
    carData.usePurpose = $("#use_purpose").val();
    carData.carCode = $("#car_code_second").val();
    carData.engineType = {
      value: $("#engine_type").val(),
      name: $("#engine_type option:selected").text(),
    };
    carData.vehicleType = {
      value: $("#vehicle_type").val(),
      name: $("#vehicle_type option:selected").text(),
    };
    carData.documentType = {
      value: $("#document_type").val(),
      name: $("#document_type option:selected").text(),
    };
    carData.documentSeriesNumber = $(".doc_series_number").val();
    carData.documentIssueDate = $("#doc_date_issue").val();
    carData.idType = {
      value: $("#id_type").val(),
      name: $("#id_type option:selected").text(),
    };
    carData.idNumber = $(".id_number").val();
    console.log(carData);
    toggleList(2, 3);

    navigate_page(3);
  });

  // show owner by checkbox

  const ownerCheck = $("#me_owner");
  const ownerBlock = $("#policy_owner");
  ownerCheck.on("change", function () {
    if (ownerCheck.is(":checked")) {
      ownerBlock.fadeOut(300);
    } else ownerBlock.fadeIn(300);
  });

  //show org_issue by checkbox

  const ownerCitizen = $("#owner_is_citizen");
  const ownerOrgIssue = $("#owner_org_issue");
  const holderCitizen = $("#holder_is_citizen");
  const holderOrgIssue = $("#holder_org_issue");

  ownerCitizen.on("change", function () {
    if (ownerCitizen.is(":checked")) {
      ownerOrgIssue.fadeIn(300);
    } else ownerOrgIssue.fadeOut(300);
  });

  holderCitizen.on("change", function () {
    if (holderCitizen.is(":checked")) {
      holderOrgIssue.fadeIn(300);
    } else holderOrgIssue.fadeOut(300);
  });

  // list 3 data save

  $("#next_3").on("click", function (event) {
    $("#policy_holder")
      .find("input,select")
      .each(function () {
        const name = $(this).attr("name");
        const type = $(this).attr("type");
        const value = $(this).val();
        if (type == "checkbox") {
          policyHolder[name] = $(this).is(":checked");
        } else if (name == "gender") {
          policyHolder[name] = {
            value,
            name: $("option:selected", this).text(),
          };
        } else if (name == "address") {
          policyHolder[name] = {
            value: JSON.parse($(this).attr("option-value")),
            name: value,
          };
        } else {
          policyHolder[name] = value;
        }
      });
    if (policyHolder.me_owner) {
      const { email, phone_number, me_owner, ...rest } = policyHolder;
      Object.assign(policyOwner, rest);
    } else {
      $("#policy_owner")
        .find("input,select")
        .each(function () {
          const name = $(this).attr("name");
          const type = $(this).attr("type");
          const value = $(this).val();
          if (type == "checkbox") {
            policyOwner[name] = $(this).is(":checked");
          } else if (name == "gender") {
            policyOwner[name] = {
              value,
              name: $("option:selected", this).text(),
            };
          } else if (name == "address") {
            policyOwner[name] = {
              value: JSON.parse($(this).attr("option-value")),
              name: value,
            };
          } else {
            policyOwner[name] = value;
          }
        });
    }
    console.log(policyHolder);
    console.log(policyOwner);

    toggleList(3, 4);

    navigate_page(4);
  });

  // list 4 data save

  $("#next_4").on("click", function (event) {
    if ($("#limited_drivers").hasClass("selected_btn")) {
      drivers = [];
      for (let i = 1; i <= driversCount; i++) {
        const driverData = {};
        $(`#driver_block_${i}`)
          .find("input,select")
          .each(function () {
            const name = $(this).attr("name");
            const type = $(this).attr("type");
            const value = $(this).val();
            if (type == "checkbox") {
              driverData[name] = $(this).is(":checked");
            } else if (type == "search") {
              driverData[name] = {
                name: $("option:selected", this).text(),
                value,
              };
            } else if (name == "gender") {
              driverData[name] = {
                value,
                name: $("option:selected", this).text(),
              };
            } else {
              driverData[name] = value;
            }
          });
        drivers.push({ ...driverData });
      }
    } else {
      drivers = [];
    }

    $("#car_brand_model").text(
      `${carData?.brand?.value || ""} ${carData?.model?.value || ""}`
    );
    $("#car_power_issue").text(
      `${carData.engine || ""} л.с., ${carData.year || ""} г.в.`
    );
    $("#id_series_number_data").text(carData.idNumber || "");
    $("#use_purpose_data").text(carData.usePurpose || "");
    $("#doc_number_data").text(
      `серия и номер ${carData.documentSeriesNumber || ""}`
    );
    $("#doc_issue_date_data").text(
      `дата выдачи ${carData.documentIssueDate || ""}`
    );

    $("#holder_FIO").text(
      `${policyHolder.last_name || ""} ${policyHolder.first_name || ""} ${
        policyHolder.middle_name || ""
      }`
    );
    $("#holder_birth_date_data").text(`${policyHolder.birth_date || ""}`);
    $("#holder_gender_data").text(`${policyHolder?.gender?.name || ""}`);
    $("#holder_passport_rus_data").text(`${policyHolder.passport_data || ""}`);
    $("#holder_registration_address").text(
      `${policyHolder?.address.name || ""}`
    );
    $("#holder_owner_same").text(
      policyHolder.passport_data == policyOwner.passport_data ? "Да" : "Нет"
    );
    $("#holder_email").text(policyHolder.email || "");
    $("#holder_phone_number").text(policyHolder.phone_number || "");

    $("#owner_FIO").text(
      `${policyOwner.last_name || ""} ${policyOwner.first_name || ""} ${
        policyOwner.middle_name || ""
      }`
    );
    $("#owner_birth_date_data").text(`${policyOwner.birth_date || ""}`);
    $("#owner_gender_data").text(`${policyOwner?.gender?.name || ""}`);
    $("#owner_passport_rus_data").text(`${policyOwner.passport_data || ""}`);
    $("#owner_registration_address").text(
      `${policyOwner?.address?.name || ""}`
    );

    $(".driver_data_block").remove();
    for (let i = 0; i < drivers.length; i++) {
      const currentDriver = createDriverLabelBlock(drivers[i], i + 1);
      $(".text_block").append(currentDriver);
    }

    toggleList(4, 5);

    navigate_page(5);
  });

  // block_4 logic

  $("#multi_drive").on("click", function () {
    $(".driver_add_block").fadeOut(300);

    $("#multi_drive").addClass("selected_btn");
    $("#multi_drive").removeClass("unselected_btn");
    $("#limited_drivers").addClass("unselected_btn");
    $("#limited_drivers").removeClass("selected_btn");
  });
  $("#limited_drivers").on("click", function () {
    $(".driver_add_block").fadeIn(300);

    $("#limited_drivers").addClass("selected_btn");
    $("#limited_drivers").removeClass("unselected_btn");
    $("#multi_drive").addClass("unselected_btn");
    $("#multi_drive").removeClass("selected_btn");
  });

  let driversCount = 1;
  const driverInputs = $(".driver_inputs");
  const first_driver = "#driver_1";
  const first_driverBlock = createDriverBlock(driversCount);
  driverInputs.append(first_driverBlock);
  const firstInputBlock = `#driver_block_${driversCount}`;

  setMaskAndCalendar();

  $(first_driver).on("click", function () {
    toggleDriverButton(first_driver);

    toggleDriverBlock(firstInputBlock);
  });
  $(first_driver).css("background-color", "var(--secondary-color)");

  $("#add_button").on("click", function () {
    if (driversCount < 5) {
      // $('.driver_list').last();
      driversCount++;

      const currentDriver = `#driver_${driversCount}`;
      $(
        `<button class="box_shadow" id="driver_${driversCount}">${driversCount}</button >`
      ).insertBefore("#add_button");

      toggleDriverButton(currentDriver);

      const currentDriverBlock = createDriverBlock(driversCount);
      driverInputs.append(currentDriverBlock);

      setMaskAndCalendar();

      const currentInputBlock = `#driver_block_${driversCount}`;
      toggleDriverBlock(currentInputBlock);

      $(currentDriver).on("click", function () {
        toggleDriverButton(currentDriver);

        toggleDriverBlock(currentInputBlock);
      });
    }
  });

  // block_5 logic
  $("#next_5").on("click", function (event) {
    calculateData();
    toggleList(5, 6);

    navigate_page(6);
  });
});

function toggleList(hide, show) {
  $(`#list_${hide}`).fadeOut(300);
  $(`#list_${show}`).css("display", "flex").hide().fadeIn(300);
}

function toggleDriverButton(currentDriver) {
  $(".driver_list")
    .children()
    .not(currentDriver)
    .not("#add_button")
    .css("background-color", "var(--secondary_background)");
  $(currentDriver).css("background-color", "var(--secondary-color)");
}

function toggleDriverBlock(currentInputBlock) {
  $(".driver_inputs").children().not(currentInputBlock).css("display", "none");
  $(currentInputBlock).css("display", "flex");
}

function getAddedDaysDate(days) {
  const currentDate = new Date();
  const fourDaysAfter = new Date(
    currentDate.setDate(currentDate.getDate() + days)
  );
  const day = ("0" + fourDaysAfter.getDate()).slice(-2);
  const month = ("0" + (fourDaysAfter.getMonth() + 1)).slice(-2);
  const fullDate =
    day + "." + month + "." + fourDaysAfter.getFullYear() + " г.";

  return fullDate;
}

function setMaskAndCalendar() {
  Inputmask({ mask: "9999 999999" }).mask($(".pass_series_number"));
  Inputmask({ mask: "99.99.9999 г." }).mask($(".datepicker"));

  // datepicker for calendar inputs
  $(".datepicker").datepicker({
    showButtonPanel: false,
    dateFormat: "dd.mm.yy г.",
    beforeShow: function (input, inst) {
      $(".ui-datepicker").css(datePickerStyle);
      return undefined;
    },
  });

  $(".calendar").on("click", function () {
    $("#datepicker").trigger("focus");
  });
}

const navigate_page = (page) => {
  currentPage = page;
  const windowWidth = $(window).width();

  // show border for selected list in navigation bar
  const current_nav_el = `#nav_${page}`;
  $(current_nav_el).css("border-bottom", "2px solid var(--primar-color)");
  $(".navigation_block").children().not(current_nav_el).css("border", "none");

  if (page == 1 || windowWidth < 500) {
    $(".navigation_block").css("display", "none");
  } else {
    $(".navigation_block").css("display", "flex");
  }
};

// debounce block

const debounce = (fn, ms) => {
  let timeout;
  return function () {
    const fnCall = () => {
      fn.apply(this, arguments);
    };
    clearTimeout(timeout);
    timeout = setTimeout(fnCall, ms);
  };
};

function addressChange(e, address, list) {
  const { value } = e.target;
  const url = baseUrl + `/suggest_address`;

  if (value.length > 2) {
    toggleDropDown($(address), $(list), "hide");
    $.ajax({
      url,
      method: "get",
      headers: {
        "Content-Type": "text/html",
        Accept: "*/*",
        Enc: "$2y$10$ehBSUYD9.aPIY6oOGgeCpeX5q0d3yPiLpvDpcHrhlNBWDyYipu2ua",
      },
      dataType: "text",
      data: { search: value },
      success: function (data) {
        const { suggestions } = JSON.parse(data);
        const dropdown = $(list);
        dropdown.empty();
        suggestions?.map((elem) => {
          const option = `<option value='${JSON.stringify(elem.data)}'>${
            elem.value
          }</option>`;
          dropdown.append(option);
        });
        dropDownList(address, list, "address");
      },
    });
  }
}

function brandChange(brand, list) {
  const url = baseUrl + `/brands`;

  const resultFunction = function (data) {
    const result = JSON.parse(data);
    const dropdown = $(list);
    result?.map((elem) => {
      const option = `<option value="${elem.data}">${elem.value}</option>`;
      dropdown.append(option);

      carBrands.push({ value: elem.data, name: elem.value });
    });
    dropDownList(brand, list, "brand");
  };

  ajaxGetRequest(url, resultFunction);
}

function modelChange(model, list) {
  const url = baseUrl + `/models`;

  const resultFunction = function (data) {
    const result = JSON.parse(data);
    const dropdown = $(list);
    dropdown.empty();
    result?.map((elem) => {
      const option = `<option value="${elem.id}">${elem.nameRu}</option>`;
      dropdown.append(option);
    });
    dropDownList(model, list, "model");
  };

  ajaxGetRequest(url, resultFunction, { query: carData.brand.data });
}

function yearChange(year, list) {
  const url = baseUrl + `/years`;

  const resultFunction = function (data) {
    const result = JSON.parse(data);
    const dropdown = $(list);
    dropdown.empty();
    result?.map((elem) => {
      const option = `<option value="${elem}">${elem}</option>`;
      dropdown.append(option);
    });
    dropDownList(year, list, "year");
  };

  ajaxGetRequest(url, resultFunction, { model_id: carData.model.id });
}

function engineChange(engine, list) {
  const url = baseUrl + `/powers`;

  const resultFunction = function (data) {
    const result = JSON.parse(data);
    const dropdown = $(list);
    dropdown.empty();
    result?.map((elem) => {
      const option = `<option value="${elem}">${elem}</option>`;
      dropdown.append(option);
    });
    dropDownList(engine, list, "engine");
  };

  ajaxGetRequest(url, resultFunction, {
    model_id: carData.model.id,
    year: carData.year,
  });
}

function ajaxGetRequest(url, successFunction, data = null) {
  $.ajax({
    url,
    method: "get",
    headers: {
      "Content-Type": "text/html",
      Accept: "*/*",
      Enc: "$2y$10$ehBSUYD9.aPIY6oOGgeCpeX5q0d3yPiLpvDpcHrhlNBWDyYipu2ua",
    },
    dataType: "text",
    data,
    success: successFunction,
  });
}

function cutDateText(dateString) {
  return dateString?.substring(0, dateString?.length - 3);
}

function replaceSpaces(str) {
  return str.replace(/['_'|' ']/g, "");
}

const debounceOnAddressChange = debounce(addressChange, 400);

// address block
const dropDownList = (address, list, type) => {
  const input = $(address);
  const dropdown = $(list);
  const dropdown_options = $(list).children();
  $(input).on("focus", function () {
    checkOptionsLength();
  });

  if (type == "address") checkOptionsLength();

  for (let option of dropdown_options) {
    option.onclick = function () {
      input.val(option.innerHTML);
      toggleDropDown(input, dropdown, "hide");

      if (type == "address") {
        input.attr("option-value", option.value);
      } else {
        checkInput(option, type);
      }
    };
  }

  input.on("input", function () {
    const text = String(input.val()).toUpperCase();
    for (let option of dropdown_options) {
      if (option.innerHTML.toUpperCase().indexOf(text) > -1) {
        option.style.display = "block";
      } else {
        option.style.display = "none";
      }
    }
  });
  let currentFocus = -1;
  input.on("keydown", function (e) {
    const key = Number(e.key);
    if (key == 40) {
      currentFocus++;
      addActive(dropdown_options);
    } else if (key == 38) {
      currentFocus--;
      addActive(dropdown_options);
    } else if (key == 13) {
      e.preventDefault();
      if (currentFocus > -1) {
        /*and simulate a click on the "active" item:*/
        if (dropdown_options) dropdown_options[currentFocus].click();
      }
    }
  });
  function addActive(x) {
    if (!x) return false;
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = x.length - 1;
    x[currentFocus].classList.add("active");
  }
  function removeActive(x) {
    for (let i = 0; i < x.length; i++) {
      x[i].classList.remove("active");
    }
  }
  function checkOptionsLength() {
    if (dropdown_options.length > 0) {
      toggleDropDown(input, dropdown, "show");
    }
  }
};
function toggleDropDown(input, dataList, type) {
  if (type == "show") {
    input.css("border-radius", "5px 5px 0 0");
    dataList.css("display", "block");
  } else {
    dataList.css("display", "none");
    input.css("border-radius", "5px");
  }
}

function checkInput(option, type) {
  switch (type) {
    case "brand":
      carData.brand = { data: option.value, value: option.innerHTML };
      const model = "#car_model";
      $(model).removeAttr("disabled");
      const modelList = "#model_dropdown";
      modelChange(model, modelList);
      break;
    case "model":
      carData.model = { id: option.value, value: option.innerHTML };
      const year = "#issue_year";
      $(year).removeAttr("disabled");
      const yearList = "#issue_year_dropdown";
      yearChange(year, yearList);
      break;
    case "year":
      carData.year = option.value;
      const engine = "#engine_power";
      $(engine).removeAttr("disabled");
      const engineList = "#engine_dropdown";
      engineChange(engine, engineList);
      break;
    case "engine":
      carData.engine = option.value;
      break;
  }
}

// calculate block

function calculateCarCode() {
  const carCode = $(".car_code_input").val();
  const value = carCode.replace(/\s+/g, "").replace("_", "");
  const url = baseUrl + "/auto_fill";

  $.ajax({
    url: url,
    method: "get",
    headers: {
      "Content-Type": "text/html",
      Accept: "*/*",
      Enc: "$2y$10$ehBSUYD9.aPIY6oOGgeCpeX5q0d3yPiLpvDpcHrhlNBWDyYipu2ua",
    },
    dataType: "text",
    data: { field: "number", value },
    success: function (data) {
      const result = JSON.parse(data);
      const { response } = JSON.parse(result);
      const responseData = response[0];
      const selectedBrand = carBrands?.filter(
        (brand) =>
          brand?.name?.toLowerCase() === responseData?.car_brand?.toLowerCase()
      )[0];
      carData.brand = {
        data: selectedBrand?.value,
        value: selectedBrand?.name,
      };

      $.ajax({
        url: baseUrl + "/models",
        method: "get",
        headers: {
          "Content-Type": "text/html",
          Accept: "*/*",
          Enc: "$2y$10$ehBSUYD9.aPIY6oOGgeCpeX5q0d3yPiLpvDpcHrhlNBWDyYipu2ua",
        },
        dataType: "text",
        data: { query: selectedBrand?.value },
        success: function (data) {
          const result = JSON.parse(data);
          const selectedModel = result?.models?.filter(
            (elem) =>
              elem?.nameRu?.toLowerCase() ===
              responseData?.car_model?.toLowerCase()
          )[0];
          carData.model = { id: selectedModel.id, value: selectedModel.nameRu };
        },
      });
      const enginePower = Math.ceil(responseData.engine_hp);
      $("#car_code_second").val(carCode);
      $("#car_brand").val(responseData.car_brand);
      $("#car_model").val(responseData.car_model);
      $("#issue_year").val(responseData.car_year);
      carData.year = responseData.car_year;
      $("#engine_power").val(enginePower);
      carData.engine = enginePower;
      $(".id_number").val(responseData.car_vin);

      toggleList(1, 2);
    },
  });
}

// calculating insurances

function calculateData() {
  const url = baseUrl + `/calculate`;

  const data = {
    service: "osago",
    status: "2",
    method: "all",
    osagoPeriod: "1",
    vehicleLicensePlate: replaceSpaces(carData.carCode),

    osagoStartDate: cutDateText(carData?.policyDate),
    vehicleBrandName: carData?.brand?.value,
    vehicleBrand: carData?.brand?.data.toString(),
    vehicleModelName: carData?.model?.id.toString(),
    vehicleModel: carData?.model?.value,
    vehicleYear: carData?.year?.toString(),
    autoDocumentType: carData?.documentType?.value,
    autoDocumentSerie: carData?.documentSeriesNumber?.substring(0, 4),
    autoDocumentNumber: carData?.documentSeriesNumber?.substring(5, 11),
    autoDocumentDate: cutDateText(carData?.documentIssueDate),
    identifierType: carData?.idType?.value,
    identifierNumber: carData.idNumber,
    vehicleType: carData?.vehicleType?.value,
    vehicle_power: carData.engine?.toString(),
    vehicleEngineType: carData?.engineType?.value,
    vehicleUnladenMass: null,
    vehicleTypeName: carData?.vehicleType?.name,
    vehicleUseForType: "640254020",

    isInsurerClient:
      policyHolder?.address?.name == policyOwner?.address?.name ? 1 : 0,
    insurerLastName: policyHolder?.last_name,
    insurerFirstName: policyHolder?.first_name,
    insurerMiddleName: policyHolder?.middle_name,
    insurerGender: policyHolder?.gender?.value,
    insurerPassportOrganisation: policyHolder?.org_issue,
    insurerBirthDate: cutDateText(policyHolder?.birth_date),
    insurerPhoneNumber: policyHolder?.phone_number?.substring(0, 3),
    insurerEmailAddress: policyHolder?.email,
    insurerPassportSerie: policyHolder?.passport_data?.substring(0, 4),
    insurerPassportNumber: policyHolder?.passport_data?.substring(5, 11),
    insurerPassportOrganisationCode: policyHolder?.section_code,
    insurerPassportDate: cutDateText(policyHolder?.passport_date),

    insurerAddressesKladrCode: policyHolder?.address?.value?.kladr_id,
    insurerAreaType: policyHolder?.address?.value?.area_type,
    insurerAreaName: policyHolder?.address?.value?.area,
    insurerAreaKladr: policyHolder?.address?.value?.area_kladr_id,
    insurerRegionKladrCode: policyHolder?.address?.value?.region_kladr_id,
    insurerRegionName: policyHolder?.address?.value?.region,
    insurerRegionType: policyHolder?.address?.value?.region_type,
    insurerCountryCode: policyHolder?.address?.value?.country_iso_code,
    insurerCityDistrictKladrCode:
      policyHolder?.address?.value?.city_district_kladr_id,
    insurerCityDistrictType: policyHolder?.address?.value?.city_district_type,
    insurerCityDistrict: policyHolder?.address?.value?.city_district,
    insurerCityKladrCode: policyHolder?.address?.value?.city_kladr_id,
    insurerCityName: policyHolder?.address?.value?.city,
    insurerCityType: policyHolder?.address?.value?.city_type,
    insurerSettlementKladrCode:
      policyHolder?.address?.value?.settlement_kladr_id,
    insurerSettlementType: policyHolder?.address?.value?.settlement_type,
    insurerSettlementName: policyHolder?.address?.value?.settlement,
    insurerStreetKladrCode: policyHolder?.address?.value?.street_kladr_id,
    insurerStreetName: policyHolder?.address?.value?.street,
    insurerStreetType: policyHolder?.address?.value?.street_type,
    insurerHouseKladrCode: policyHolder?.address?.value?.house_kladr_id,
    insurerHouseType: policyHolder?.address?.value?.house_type,
    insurerHouse: policyHolder?.address?.value?.house,
    insurerBlock: policyHolder?.address?.value?.block,
    insurerBlockType: policyHolder?.address?.value?.block_type,
    insurerFlat: policyHolder?.address?.value?.flat,
    insurerFlatType: policyHolder?.address?.value?.flat_type,
    insurerOkato: policyHolder?.address?.value?.okato,
    insurerFias: policyHolder?.address?.value?.fias_id,
    insurerSettlementFias: policyHolder?.address?.value?.settlement_fias_id,
    insurerStreetFias: policyHolder?.address?.value?.street_fias_id,
    insurerCityFias: policyHolder?.address?.value?.city_fias_id,
    insurerHouseFias: policyHolder?.address?.value?.house_fias_id,
    insurerPostalCode: policyHolder?.address?.value?.postal_code,
    insurerRegionFiasCode: policyHolder?.address?.value?.region_fias_id,
    insurerCityFiasCode: policyHolder?.address?.value?.city_fias_id,
    insurerSettlementFiasCode: policyHolder?.address?.value?.settlement_fias_id,
    insurerStreetFiasCode: policyHolder?.address?.value?.street_fias_id,
    insurerAreaFiasCode: policyHolder?.address?.value?.area_fias_id,
    insurerDaData: JSON.stringify(policyHolder?.address?.value || ""),
    insurerAddressName: policyHolder?.address?.name,

    clientLastName: policyOwner.last_name,
    clientFirstName: policyOwner.first_name,
    clientMiddleName: policyOwner.middle_name,
    clientGender: policyOwner?.gender?.value,
    clientBirthDate: cutDateText(policyOwner.birth_date),
    clientPassportOrganisation: policyOwner.org_issue,
    clientPassportDate: cutDateText(policyOwner.passport_date),
    isClientForeigner: policyOwner?.is_citizen ? 1 : 0,
    clientPassportSerie: policyOwner?.passport_data?.substring(0, 4),
    clientPassportNumber: policyOwner?.passport_data?.substring(5, 11),
    clientPassportOrganisationCode: policyOwner?.section_code,

    clientAddressesKladrCode: policyOwner?.address?.value?.kladr_id,
    clientAreaType: policyOwner?.address?.value?.area_type,
    clientAreaName: policyOwner?.address?.value?.area,
    clientAreaKladr: policyOwner?.address?.value?.area_kladr_id,
    clientRegionKladrCode: policyOwner?.address?.value?.region_kladr_id,
    clientRegionName: policyOwner?.address?.value?.region,
    clientRegionType: policyOwner?.address?.value?.region_type,
    clientCountryCode: policyOwner?.address?.value?.country_iso_code,
    clientCityDistrictKladrCode:
      policyOwner?.address?.value?.city_district_kladr_id,
    clientCityDistrictType: policyOwner?.address?.value?.city_district_type,
    clientCityDistrict: policyOwner?.address?.value?.city_district,
    clientCityKladrCode: policyOwner?.address?.value?.city_kladr_id,
    clientCityName: policyOwner?.address?.value?.city,
    clientCityType: policyOwner?.address?.value?.city_type,
    clientSettlementKladrCode: policyOwner?.address?.value?.settlement_kladr_id,
    clientSettlementType: policyOwner?.address?.value?.settlement_type,
    clientSettlementName: policyOwner?.address?.value?.settlement,
    clientStreetKladrCode: policyOwner?.address?.value?.street_kladr_id,
    clientStreetName: policyOwner?.address?.value?.street,
    clientStreetType: policyOwner?.address?.value?.street_type,
    clientHouseKladrCode: policyOwner?.address?.value?.house_kladr_id,
    clientHouseType: policyOwner?.address?.value?.house_type,
    clientHouse: policyOwner?.address?.value?.house,
    clientBlock: policyOwner?.address?.value?.block,
    clientBlockType: policyOwner?.address?.value?.block_type,
    clientFlat: policyOwner?.address?.value?.flat,
    clientFlatType: policyOwner?.address?.value?.flat_type,
    clientOkato: policyOwner?.address?.value?.okato,
    clientFias: policyOwner?.address?.value?.fias_id,
    clientSettlementFias: policyOwner?.address?.value?.settlement_fias_id,
    clientStreetFias: policyOwner?.address?.value?.street_fias_id,
    clientCityFias: policyOwner?.address?.value?.city_fias_id,
    clientHouseFias: policyOwner?.address?.value?.house_fias_id,
    clientPostalCode: policyOwner?.address?.value?.postal_code,
    clientRegionFiasCode: policyOwner?.address?.value?.region_fias_id,
    clientCityFiasCode: policyOwner?.address?.value?.city_fias_id,
    clientSettlementFiasCode: policyOwner?.address?.value?.settlement_fias_id,
    clientStreetFiasCode: policyOwner?.address?.value?.street_fias_id,
    clientAreaFiasCode: policyOwner?.address?.value?.area_fias_id,
    clientDaData: JSON.stringify(policyOwner?.address?.value || ""),
    clientAddressName: policyOwner?.address?.name,

    driverCount: drivers?.length?.toString(),
    // isUnlimitedDrivers: drivers?.length === 0 ? 1 : 0,
  };
  for (let i = 0; i < drivers.length; i++) {
    data[`driver${i + 1}BirthDate`] = cutDateText(drivers[i]?.birth_date);
    data[`driver${i + 1}LastName`] = drivers[i]?.last_name;
    data[`driver${i + 1}FirstName`] = drivers[i]?.first_name;
    data[`driver${i + 1}MiddleName`] = drivers[i]?.middle_name;
    data[`driver${i + 1}Gender`] = drivers[i]?.gender?.id ?? 1;
    // data[`driver${i + 1}ForeignDriverLicense`] = drivers[i]?.foreign_license;
    data[`driver${i + 1}Serie`] = drivers[i]?.current_driver_license?.substring(0, 4);
    data[`driver${i + 1}Number`] = drivers[i]?.current_driver_license?.substring(6, 12);
    data[`driver${i + 1}PreviousLicenseSerie`] = drivers[i]?.previous_driver_license?.substring(0, 4) ?? null;
    data[`driver${i + 1}PreviousLicenseNumber`] = drivers[i]?.previous_driver_license?.substring(6, 12) ?? null;
    data[`driver${i + 1}LicenseIssue`] = cutDateText(drivers[i]?.license_date);
    data[`driver${i + 1}FirstLicenseIssue`] = cutDateText(
      drivers[i]?.first_license_date
    );
  }

  console.log(data);
  $.ajax({
    url,
    method: "post",
    headers: {
      "Content-Type": "text/html",
      Accept: "*/*",
      Enc: "$2y$10$ehBSUYD9.aPIY6oOGgeCpeX5q0d3yPiLpvDpcHrhlNBWDyYipu2ua",
    },
    contentType: "application/json; charset=utf-8",
    data: JSON.stringify(data),
    success: function (data) {
      const result = JSON.parse(data);
      console.log(result);
    },
  });
}

// html block

const globalContainer = '<div class="global_container"></div>';
const navigationBlock = `
    <div class="navigation_block">
        <div id="nav_2" class="navigation_block_el">
            <span class="navigation_el">
                Автомобиль
            </span>
            <img class="navigation_img" src="./assets/images/car.svg">
        </div>
        
        <img class="navigation_arrow" src="./assets/images/right_arrow.svg" />
        <div id="nav_3" class="navigation_block_el">
            <span class="navigation_el">
                Страхователь
            </span>
            <img class="navigation_img" src="./assets/images/policy-holder.svg">
        </div>
        <img class="navigation_arrow" src="./assets/images/right_arrow.svg" />
        <div id="nav_4" class="navigation_block_el">        
            <span class="navigation_el">
                Водители
            </span>
            <img class="navigation_img" src="./assets/images/driver.svg">
        </div>

        <img class="navigation_arrow" src="./assets/images/right_arrow.svg" />
        
        <div id="nav_5" class="navigation_block_el">
            <span class="navigation_el">
                Проверка данных
            </span>
            <img class="navigation_img" src="./assets/images/check-data.svg">
        </div>
        <img class="navigation_arrow" src="./assets/images/right_arrow.svg" />
        <div id="nav_6" class="navigation_block_el">
            <span  class="navigation_el">
                Рассчет
            </span>
            <img class="navigation_img" src="./assets/images/processing.svg">
        </div>
    </div>`;
const block_1 = `
    <div id="list_1" class="container">
    <div class="main__block">
        <h1 class="main__header">автострахование</h1>
        <div class="list_1__body">
            <div class="list_1__body_left"><span>в любое время суток и любую погоду</span></div>
            <div class="list_1__body_right">
                <div class="body_right_text"><span id="right_block_title">Введите номер автомобиля</span><span
                        id="right_block_helper">Мы автоматически заполним ваши данные</span></div>
                <div class="body_right_number_block">
                <input class="car_code_input" name="carCode" type="text" placeholder="a 000 aa 000" maxlength="12" />
                    <div class="vertical_divider"></div>
                    <div class="russian_flag">
                        <div id="white_block"></div>
                        <div id="blue_block"></div>
                        <div id="red_block"></div>
                    </div><span id="flag_name">rus</span>
                </div>
                    <button id="calculate_btn" class="primary_button" >
                        Рассчитать
                    </button>
                    <span class="no_number">У меня
                        <button id="next_1" class="next_block">нет номера</button>
                    </span>
            </div>
        </div>
        <div class="list_1__footer">Ramosago — сервис №1 по продаже ОСАГО в городе Раменское</div>
    </div>
    </div>`;
const block_2 = `
    <div class="container" id="list_2">
        <div class="main__block">
            <h1 class="main__header">данные для расчета</h1>
            <div class="input__block">
                <span class="description__text">
                    Данные автомобиля
                </span>
                <div class="grid__inputs">
                    <div class="input__el calendar">
                        <label for="policy_date">Начало действия полиса</label>
                        <input id="policy_date" class="datepicker" type="text" name="policy_date">
                    </div>
                    <div class="input__el">
                        <label for="use_purpose">Цель использования</label>
                        <input id="use_purpose" type="text" name="use_purpose" value="Личная" disabled>
                    </div>
                    <div class="input__el">
                        <label for="government_number">Государственный номер</label>
                        <input id="car_code_second" class="car_code_input" type="text" name="government_number" placeholder="А 000 АА 000">
                    </div>
                    <div class="input__el">
                        <label for="car_brand">Марка автомобиля</label>
                        <input list="" id="car_brand" role="combobox" name="car_brand" autocomplete="off" placeholder="Марка автомобиля" />
                        <datalist id="brand_dropdown" role="listbox"></datalist>
                    </div>
                    <div class="input__el">
                        <label for="car_model">Модель автомобиля</label>
                        <input list="" id="car_model" disabled role="combobox" name="car_model" autocomplete="off" placeholder="Модель машины" />
                        <datalist id="model_dropdown" role="listbox"></datalist>
                    </div>
                    <div class="input__el">
                        <label for="issue_year">Год выпуска</label>
                        <input list="" id="issue_year" disabled role="combobox" name="issue_year" autocomplete="off" placeholder="2013 г." />
                        <datalist id="issue_year_dropdown" role="listbox"></datalist>
                    </div>
                    <div class="input__el">
                        <label for="engine_power">Мощность двигателя</label>
                        <input list="" id="engine_power" disabled role="combobox" name="engine_power" autocomplete="off" placeholder="150 л.с." />
                        <datalist id="engine_dropdown" role="listbox"></datalist>
                    </div>
                    <div class="input__el">
                        <label for="engine_type">Тип двигателя</label>
                        <select id="engine_type" class="select_menu" name="engine_type">
                        <option value="P">Бензин</option>
                        <option value="D">Дизель</option>
                        <option value="E">Электро</option>
                        <option value="H">Гибрид</option>
                    </select>
                    </div>
                    <div class="input__el">
                        <label for="vehicle_type">Тип транспортного средства</label>
                        <select id="vehicle_type" class="select_menu" name="vehicle_type">
                            <option value="640189240">Легковые автомобили</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="input__block">
                <span class="description__text">
                    Документы автомобиля
                </span>
                <div class="grid__inputs">
                    <div class="input__el">
                        <label for="document">Документ</label>
                        <select id="document_type" class="select_menu" name="document">
                            <option value="pts">ПТС</option>
                            <option value="sts">СТС</option>
                            <option value="epts">ЭПТС</option>
                        </select>
                    </div>
                    <div class="input__el">
                        <label id="doc_series_number_label" for="series_number">Серия и номер ПТС</label>
                        <input class="doc_series_number" type="text" name="series_number" placeholder="12 АА 345678">
                    </div>
                    <div class="input__el calendar">
                        <label id="doc_date_issue_label" for="doc_date_issue">Дата выдачи ПТС</label>
                        <input id="doc_date_issue" class="datepicker" type="text" name="doc_date_issue" placeholder="01.08.2022 г.">
                    </div>
                    <div class="input__el">
                        <label for="identificator">Идентификатор</label>
                        <select id="id_type" class="select_menu" name="identificator">
                            <option value="vin">ВИН</option>
                            <option value="body">Номер кузова</option>
                            <option value="chassis">Шасси</option>
                        </select>
                    </div>
                    <div class="input__el">
                        <label id="id_number_label" for="id_number">Номер VIN</label>
                        <input class="id_number" type="text" name="id_number" placeholder="KMHDU41BP8U437793">
                    </div>
                </div>
            </div>
            <div class="centered_button">
                <button id="back_2" class="secondary_button">Вернутся назад</button>
                <button id="next_2" class="primary_button">Продолжить</button>
            </div>
        </div>
    </div>`;
const block_3 = `
    <div class="container" id="list_3">
        <div class="main__block">
            <h1 class="main__header">Страхователь и Собственник</h1>
            <div id="policy_holder" class="input__block">
                <span class="description__text">
                    Страхователь
                </span>
                <div class="grid__inputs">
                    <div class="input__el">
                        <label for="last_name">Фамилия</label>
                        <input type="text" name="last_name" placeholder="Иванов">
                    </div>
                    <div class="input__el">
                        <label for="first_name">Имя</label>
                        <input type="text" name="first_name" placeholder="Иван">
                    </div>
                    <div class="input__el">
                        <label for="middle_name">Отчество</label>
                        <input type="text" name="middle_name" placeholder="Иванович">
                    </div>
                </div>
                <div class="grid__inputs">
                    <div class="input__el calendar">
                        <label for="birth_date">Дата рождения</label>
                        <input class="datepicker" type="text" name="birth_date" placeholder="23.10.1995 г.">
                    </div>
                    <div class="input__el">
                        <label for="gender">Пол</label>
                        <select class="select_menu" name="gender">
                            <option value="1">Мужской</option>
                            <option value="2">Женский</option>
                        </select>
                    </div>
                </div>
                <div class="grid__inputs">
                    <div class="input__el">
                        <label for="passport_data">Серия и номер паспорта</label>
                        <input class="pass_series_number" type="text" name="passport_data" placeholder="12 34 567890">
                    </div>
                    <div class="input__el calendar">
                        <label for="passport_date">Дата выдачи</label>
                        <input class="datepicker" type="text" name="passport_date" placeholder="05.05.2009 г.">
                    </div>
                    <div class="input__el">
                        <label for="section_code">Код подразделения</label>
                        <input class="section_code" type="text" name="section_code" placeholder="Код подразделения">
                    </div>
                </div>
                <div class="grid__inputs">
                <div class="checkbox">
                    <input id="holder_is_citizen" type="checkbox" name="is_citizen">
                    <label for="is_citizen">Не резидент РФ</label>
                </div>
                <div id="holder_org_issue" class="input__el">
                    <label for="org_issue">Кем выдан</label>
                    <input  type="text" name="org_issue" placeholder="Введите организацию">
                </div>
            </div>
                <div class="none_grid">
                    <div class="input__el">
                        <label for="address">Адрес</label>
                        <input list="" type="search" id="holder_address" role="combobox" class="full_width"
                            name="address" autocomplete="off" placeholder="Введите адрес" />
                        <datalist id="holder_dropdown" class="full_width" role="listbox">
                        </datalist>
                    </div>
                </div>
                <div class="grid__inputs">
                    <div class="input__el">
                        <label for="email">Почта (на него придет полис)</label>
                        <input type="text" name="email" type="email" placeholder="ivanov@gmail.com">
                    </div>
                    <div class="input__el">
                        <label for="phone_number">Номер телефона</label>
                        <input class="phone_number" type="text" name="phone_number" placeholder="+7 (916) 715-45-20">
                    </div>
                    <div class="checkbox">
                        <input id="me_owner" type="checkbox" name="me_owner">
                        <label for="me_owner">Я собственник</label>
                    </div>
                </div>
            </div>
            <div id="policy_owner" class="input__block">
                <span class="description__text">
                    Собственник
                </span>
                <div class="grid__inputs">
                    <div class="input__el">
                        <label for="last_name">Фамилия</label>
                        <input type="text" name="last_name" placeholder="Иванов">
                    </div>
                    <div class="input__el">
                        <label for="first_name">Имя</label>
                        <input type="text" name="first_name" placeholder="Иван">
                    </div>
                    <div class="input__el">
                        <label for="middle_name">Отчество</label>
                        <input type="text" name="middle_name" placeholder="Иванович">
                    </div>
                </div>
                <div class="grid__inputs">
                    <div class="input__el calendar">
                        <label for="birth_date">Дата рождения</label>
                        <input class="datepicker" type="text" name="birth_date" placeholder="23.10.1995 г.">
                    </div>
                    <div class="input__el">
                        <label for="gender">Пол</label>
                        <select class="select_menu" name="gender">
                            <option value="1">Мужской</option>
                            <option value="2">Женский</option>
                        </select>
                    </div>
                </div>
                <div class="grid__inputs">
                    <div class="input__el">
                        <label for="passport_data">Серия и номер паспорта</label>
                        <input class="pass_series_number" type="text" name="passport_data" placeholder="12 34 567890">
                    </div>
                    <div class="input__el calendar">
                        <label for="passport_date">Дата выдачи</label>
                        <input class="datepicker" type="text" name="passport_date" placeholder="05.05.2009 г.">
                    </div>
                    <div class="input__el">
                        <label for="section_code">Код подразделения</label>
                        <input class="section_code" type="text" name="section_code" placeholder="Код подразделения">
                    </div>
                </div>
                <div class="grid__inputs">
                    <div class="checkbox">
                        <input id="owner_is_citizen" type="checkbox" name="is_citizen">
                        <label for="is_citizen">Не резидент РФ</label>
                    </div>
                    <div id="owner_org_issue" class="input__el">
                        <label for="org_issue">Кем выдан</label>
                        <input  type="text" name="org_issue" placeholder="Введите организацию">
                    </div>
                </div>
                <div class="none_grid">
                    <div class="input__el">
                        <label for="address">Адрес</label>
                        <input list="" type="search" id="owner_address" role="combobox" class="full_width"
                            name="address" autocomplete="off" placeholder="Введите адрес" />
                        <datalist id="owner_dropdown" class="full_width" role="listbox">
                        </datalist>
                    </div>
                </div>
            </div>
            <div class="centered_button">
                <button id="back_3" class="secondary_button">Вернутся назад</button>
                <button id="next_3" class="primary_button">Продолжить</button>
            </div>
        </div>
    </div>`;

function createDriverBlock(count) {
  return `
    <div id="driver_block_${count}" class="input__block">
    <div class="grid__inputs">
        <div class="input__el">
                                    <label for="last_name">Фамилия</label>
                                    <input type="text" name="last_name" placeholder="Иванов">
                                </div>
                                <div class="input__el">
                                    <label for="first_name">Имя</label>
                                    <input type="text" name="first_name" placeholder="Иван">
                                </div>
                                <div class="input__el">
                                    <label for="middle_name">Отчество</label>
                                    <input type="text" name="middle_name" placeholder="Иванович">
                                </div>
                            </div>
                            <div class="grid__inputs">
                                <div class="input__el calendar">
                                    <label for="birth_date">Дата рождения</label>
                                    <input class="datepicker" type="text" name="birth_date" placeholder="23.10.1995 г.">
                                </div>
                                <div class="input__el">
                                    <label for="gender">Пол</label>
                                    <select class="select_menu" name="gender">
                                        <option value="1">Мужской</option>
                                        <option value="2">Женский</option>
                                    </select>
                                </div>
                            </div>
                            <div class="grid__inputs">
                                <div class="checkbox">
                                    <input type="checkbox" name="is_citizen">
                                    <label for="is_citizen">Не резидент РФ</label>
                                </div>
                                <div class="checkbox">
                                    <input type="checkbox" name="foreign_license">
                                    <label for="foreign_license">Иностранные права</label>
                                </div>
                                <div class="input__el">
                                    <label for="current_driver_license">Номер и серия ВУ</label>
                                    <input class="pass_series_number" type="text" name="current_driver_license" placeholder="12 34 567890">
                                </div>
                            </div>
                            <div class="grid__inputs">
                                <div class="input__el calendar">
                                    <label for="license_date">Дата выдачи ВУ</label>
                                    <input class="datepicker" type="text" name="license_date" placeholder="05.05.2009 г.">
                                </div>
                                <div class="input__el calendar">
                                    <label for="first_license_date">Дата выдачи первого ВУ</label>
                                    <input class="datepicker" type="text" name="first_license_date"
                                        placeholder="05.05.2009 г.">
                                </div>
                            </div>
                            <div class="grid__inputs">
                                <div class="checkbox">
                                    <input type="checkbox" name="previous_license">
                                    <label for="previous_license">Указать предыдущие права</label>
                                </div>
                                <div class="input__el">
                                    <label for="previous_driver_license">Номер и серия ВУ</label>
                                    <input class="pass_series_number" type="text" name="previous_driver_license" placeholder="12 34 567890">
                                </div>
                            </div>
                            </div>`;
}
const block_4 = `
        <div class="container" id="list_4">
            <div class="main__block">
                <h1 class="main__header">Водители</h1>
                <div id="button_block">
                    <button id="limited_drivers" class="selected_btn">
                        Ограниченное число водителей
                    </button>
                    <button id="multi_drive" class="unselected_btn">
                        Мультидрайв
                    </button>
                </div>
                <div class="driver_add_block">
                    <div class="driver_title_block">
                        <span class="description__text">
                            Данные водителя
                        </span>
                        <div class="driver_selector">
                            <div class="grid__buttons">
                                <button id="driver_1" class="box_shadow">
                                    1
                                </button>
                                <button id="add_button" class="box_shadow">
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="horiz_divider"></div>
                    <div class="driver_inputs"></div>
                </div>
                <div class="centered_button">
                    <button id="back_4" class="secondary_button">Вернутся назад</button>
                    <button id="next_4" class="primary_button">Продолжить</button>
                </div>
            </div>
        </div>`;
function createDriverLabelBlock(driver, step) {
  return `
    <div class="label_block driver_data_block">
    <span class="description_block">Водитель ${step}</span>
    <div class="label_el">
        <span class="label_title">
            ФИО
        </span>
        <span class="label_text">
        ${driver.last_name || ""} ${driver.first_name || ""} ${
    driver.middle_name || ""
  }
        </span>
    </div>
    <div class="label_el">
        <span class="label_title">
            Дата рождения
        </span>
        <span class="label_text">
            ${driver.birth_date || ""}
        </span>
    </div>
    <div class="label_el">
        <span class="label_title">
            Пол
        </span>
        <span class="label_text">
            ${driver?.gender?.name || ""}
        </span>
    </div>
    <div class="label_el">
        <span class="label_title">
            Водительское <br>
            удостоверение РФ
        </span>
        <span class="label_text">
            серия и номер <br>
            ${driver.current_driver_license || ""}
        </span>
    </div>
    <div class="label_el">
        <span class="label_title">
            Дата выдачи первого ВУ
        </span>
        <span class="label_text">
        ${driver.first_license_date || ""}
        </span>
    </div>
    <div class="label_el">
        <span class="label_title">
            Дата выдачи ВУ
        </span>
        <span class="label_text">
            ${driver.license_date || ""}
        </span>
    </div>
    <div class="label_el">
        <span class="label_title">
            Предыдущее <br>
            удостоверение РФ
        </span>
        <span class="label_text">
            серия и номер <br>
            ${driver.previous_driver_license || ""}
        </span>
    </div>
</div>    
    `;
}

const block_5 = `
    <div class="container" id="list_5">
        <div class="main__block">
            <h1 class="main__header">Проверка данных</h1>
            <div class="text_block">
                <div class="label_block">
                    <span class="description_block">Автомобиль</span>
                    <div class="label_el">
                        <span class="label_title">
                            Марка и модель
                        </span>
                        <span id="car_brand_model" class="label_text">
                            BMW 1 SERIES
                        </span>
                    </div>
                    <div class="label_el">
                        <span class="label_title">
                            Характеристики автомобиля
                        </span>
                        <span id="car_power_issue" class="label_text">
                            100 л.с., 2022 г.в.
                        </span>
                    </div>
                    <div class="label_el">
                        <span class="label_title">
                            ВИН
                        </span>
                        <span id="id_series_number_data" class="label_text">
                            2312 234234
                        </span>
                    </div>
                    <div class="label_el">
                        <span  class="label_title">
                            Цель использования
                        </span>
                        <span id="use_purpose_data" class="label_text">
                            Личная
                        </span>
                    </div>
                    <div class="label_el">
                        <span  class="label_title">
                            ПТС
                        </span>
                        <div class="input__el">
                            <span id="doc_number_data" class="label_text">
                                серия и номер 2342 2342344 <br>
                            </span>
                            <span id="doc_issue_date_data" class="label_text">
                                    дата выдачи 02.02.2002 г.
                            </span>
                        </div>
                    </div>
                </div>
                <div class="label_block">
                    <span class="description_block">Страхователь</span>
                    <div class="label_el">
                        <span class="label_title">
                            ФИО
                        </span>
                        <span id="holder_FIO" class="label_text">
                            Джораев Азамат Заурович
                        </span>
                    </div>
                    <div class="label_el">
                        <span  class="label_title">
                            Дата рождения
                        </span>
                        <span id="holder_birth_date_data" class="label_text">
                            23.10.1995 г.
                        </span>
                    </div>
                    <div class="label_el">
                        <span class="label_title">
                            Пол
                        </span>
                        <span id="holder_gender_data" class="label_text">
                            Мужской
                        </span>
                    </div>
                    <div class="label_el">
                        <span class="label_title">
                            Паспорт РФ
                        </span>
                        <span id="holder_passport_rus_data" class="label_text">
                            23424 2342 3432
                        </span>
                    </div>
                    <div class="label_el">
                        <span class="label_title">
                            Адрес <br>
                            регистрации
                        </span>
                        <span id="holder_registration_address" class="label_text">
                            г. Москва, г. Зеленоград, <br>
                            поселок Малино, д. 2, 44
                        </span>
                    </div>
                    <div class="label_el">
                        <span class="label_title">
                            Страхователь и собственник одно лицо
                        </span>
                        <span id="holder_owner_same" class="label_text">
                            Да
                        </span>
                    </div>
                    <div class="label_el">
                        <span  class="label_title">
                            Почта
                        </span>
                        <span id="holder_email" class="label_text">
                            15457akdepe@gmail.com
                        </span>
                    </div>
                    <div class="label_el">
                        <span class="label_title">
                            Номер телефона
                        </span>
                        <span id="holder_phone_number" class="label_text">
                            +7 (916) 715-45-20
                        </span>
                    </div>
                </div>
                <div class="label_block">
                    <span class="description_block">Собственник</span>
                    <div class="label_el">
                        <span class="label_title">
                            ФИО
                        </span>
                        <span id="owner_FIO" class="label_text">
                            Джораев Азамат Заурович
                        </span>
                    </div>
                    <div class="label_el">
                        <span  class="label_title">
                            Дата рождения
                        </span>
                        <span id="owner_birth_date_data" class="label_text">
                            23.10.1995 г.
                        </span>
                    </div>
                    <div class="label_el">
                        <span class="label_title">
                            Пол
                        </span>
                        <span id="owner_gender_data" class="label_text">
                            Мужской
                        </span>
                    </div>
                    <div class="label_el">
                        <span class="label_title">
                            Паспорт РФ
                        </span>
                        <span id="owner_passport_rus_data" class="label_text">
                            23424 2342 3432
                        </span>
                    </div>
                    <div class="label_el">
                        <span class="label_title">
                            Адрес <br>
                            регистрации
                        </span>
                        <span id="owner_registration_address" class="label_text">
                            г. Москва, г. Зеленоград, <br>
                            поселок Малино, д. 2, 44
                        </span>
                    </div>
                </div>
            </div>
            <div class="centered_button">
                <button id="back_5" class="secondary_button">Вернутся назад</button>
                <button id="next_5" class="primary_button">Продолжить</button>
            </div>
        </div>
    </div>`;
const block_6 = `
    <div class="container" id="list_6">
            <div class="main__block fixed_padding">
                <h1 class="main__header">Выбор компании и оплата</h1>
                <div class="single_input">
                    <div class="input__el calendar">
                        <label for="police_date">Начало действия полиса</label>
                        <input class="datepicker" type="text" name="police_date" placeholder="17.01.2023 г.">
                    </div>
                </div>
                <div class="input__block">
                    <span class="description__text">
                        Самое выгодное
                    </span>
                    <div class="police_block">
                        
                            <img class="police_icon" src="./assets/images/alpha.png" />
                        <div class="police_header">
                            <span class="police_title">
                                Альфа Страхование
                            </span>
                        
                            <span class="police_price">
                                18 677 ₽
                            </span>
                        </div>
                        <button class="secondary_button">Оплатить</button>
                    </div>
                </div>
                <div class="input__block">
                    <span class="description__text">
                        Остальные
                    </span>
                    <div class="police_block">
                            <img class="police_icon" src="./assets/images/sogaz.png" />
                            <div class="police_header">
                                <span class="police_title">
                                    СОГАЗ
                                </span>
                                <span class="police_price">
                                    13 638 ₽
                                </span>
                            </div>
                        <button class="secondary_button">Оплатить</button>
                    </div>
                    <div class="police_block">
                            <img class="police_icon" src="./assets/images/sogaz.png" />
                            <div class="police_header">
                                <span class="police_title">
                                    СОГАЗ
                                </span>
                                <span class="police_price">
                                    13 638 ₽
                                </span>
                            </div>
                        <button class="secondary_button">Оплатить</button>
                    </div>
                    <div class="police_block">
                            <img class="police_icon" src="./assets/images/sogaz.png" />
                            <div class="police_header">
                                <span class="police_title">
                                    СОГАЗ
                                </span>
                                <span class="police_price">
                                    13 638 ₽
                                </span>
                            </div>
                        <button class="secondary_button">Оплатить</button>
                    </div>
                </div>
                <div class="suggestment_block">
                    <span class="white_title">
                        Получили отказ ?
                    </span>
                    <span class="white_desc">
                        Пишите нам в месенджеры и мы поможем
                        застраховать самый сложный авто.
                    </span>
                </div>
                <div class="centered_button">
                    <button id="back_6" class="secondary_button">Вернутся назад</button>
                    <button id="next_6" class="primary_button">Продолжить</button>
                </div>
            </div>
    </div>`;
