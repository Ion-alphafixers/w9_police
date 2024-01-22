const checkPhoneNumber = async (tech_phone) => {
  const cleanedTechPhone = tech_phone.replace(/\s/g, "").replace(/[-()]/g, "");
  let q = `SELECT * FROM test_techs WHERE REPLACE(REPLACE(REPLACE(REPLACE(TRIM(tech_phone), ' ', ''), '-', ''), '(', ''), ')', '') = '${cleanedTechPhone}';`;

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

    let data = await response.json();
    console.log(data);
    if (data.length !== 0) {
      return {
        existingPhoneNUmber: data[0][2],
        tech_name: data[0][1],
        recipient_1: data[0][5],
        recipient_1_address: data[0][6],
        recipient_2: data[0][7],
        recipient_2_address: data[0][8],
        recipient_3: data[0][9],
        recipient_3_address: data[0][10],
      };
    }
    return {
      existingPhoneNUmber: false,
      tech_name: false,
      recipient_1: false,
      recipient_1_address: false,
      recipient_2: false,
      recipient_2_address: false,
      recipient_3: false,
      recipient_3_address: false,
    };
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  checkPhoneNumber,
};