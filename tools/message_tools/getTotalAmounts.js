const getW9 = async (tech_name, isBkr) => {
  console.log(tech_name);
  let q = isBkr
    ? `SELECT * FROM rbk_invoices WHERE tech_name = '${tech_name.trim()}'`
    : `SELECT * FROM payments WHERE tech_name = '${tech_name.trim()}'`;
  try {
    const response = await fetch(
      "https://i3gzeqflqihryswsazg6cf7eja0xqysp.lambda-url.us-east-2.on.aws/",
      {
        method: "POST",
        body: JSON.stringify({
          query: q,
        }),
      }
    );
    console.log(response);

    let data = await response.json();

    let totalAmount = 0;
    if (data !== null) {
      for (i of data) {
        totalAmount = isBkr ? totalAmount + +i[12] : totalAmount + +i[6];
      }
      return totalAmount;
    } else {
      return 0;
    }
  } catch (error) {
    console.log(error);
  }
};
const wo_number_total_amount_lookup = async (wo_number) => {
  let total_calculated = 0;
  const vista_response = await fetch(
    "https://i3gzeqflqihryswsazg6cf7eja0xqysp.lambda-url.us-east-2.on.aws/",
    {
      method: "POST",
      body: JSON.stringify({
        query: `SELECT * FROM payments WHERE work_order_number = '${wo_number}'`,
      }),
    }
  ).then(async (res) => await res.json());
  const bkr_response = await fetch(
    "https://i3gzeqflqihryswsazg6cf7eja0xqysp.lambda-url.us-east-2.on.aws/",
    {
      method: "POST",
      body: JSON.stringify({
        query: `SELECT * FROM rbk_invoices WHERE work_order_number = '${wo_number}'`,
      }),
    }
  ).then(async (res) => await res.json());

  if (bkr_response.length === 0 && vista_response.length !== 0) {
    vista_response.forEach((element) => {
      total_calculated += parseFloat(element[6]);
    });
    return total_calculated;
  } else if (bkr_response.length !== 0 && vista_response.length === 0) {
    bkr_response.forEach((element) => {
      total_calculated += parseFloat(element[12]);
    });
    return total_calculated;
  }
  return null;
};
const getTotalAmounts = async (query_variable, hasAdditionalTechName) => {
  let tech_phone = null;
  let additional_tech_name = null;
  if (hasAdditionalTechName) {
    additional_tech_name = query_variable;
  } else {
    tech_phone = query_variable;
  }
  let q_af = "";
  let q_bkr = "";
  if (tech_phone !== null) {
    const cleanedTechPhone = tech_phone
      .replace(/\s/g, "")
      .replace(/[-()]/g, "");
    q_af = `SELECT * FROM payments WHERE REPLACE(REPLACE(REPLACE(REPLACE(TRIM(tech_phone), ' ', ''), '-', ''), '(', ''), ')', '') = '${cleanedTechPhone}';
    `;
    q_bkr = `SELECT * FROM rbk_invoices WHERE REPLACE(REPLACE(REPLACE(REPLACE(TRIM(tech_phone), ' ', ''), '-', ''), '(', ''), ')', '') = '${cleanedTechPhone}';`;
  } else {
    const cleanedAdditionalTechName = additional_tech_name.trim();
    q_af = `SELECT * FROM payments WHERE TRIM(tech_name) = '${cleanedAdditionalTechName}';`;
    q_bkr = `SELECT * FROM rbk_invoices WHERE TRIM(tech_name) = '${cleanedAdditionalTechName}';`;
  }

  try {
    const response = await fetch(
      "https://i3gzeqflqihryswsazg6cf7eja0xqysp.lambda-url.us-east-2.on.aws/",
      {
        method: "POST",
        body: JSON.stringify({
          query: q_af,
        }),
      }
    );
    const res = await fetch(
      "https://i3gzeqflqihryswsazg6cf7eja0xqysp.lambda-url.us-east-2.on.aws/",
      {
        method: "POST",
        body: JSON.stringify({
          query: q_bkr,
        }),
      }
    );
    console.log(response);
    console.log(res);

    let data_af = await response.json();
    let data_bkr = await res.json();

    let totalAmount = 0;
    for (i of data_af) {
      totalAmount = totalAmount + +i[6];
    }
    for (i of data_bkr) {
      totalAmount = totalAmount + +i[12];
    }
    return totalAmount;
  } catch (error) {
    console.log(error);
    return 0;
  }
};

module.exports = {
  getTotalAmounts,
  wo_number_total_amount_lookup,
  getW9,
};
