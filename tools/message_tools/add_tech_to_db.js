const uuid = require('uuid')
const add_tech_to_db = async (
  tech_name,
  tech_phone,
  payment_address,
  payment_method
) => {
      let id = uuid.v4();

  const cleanedTechPhone = tech_phone.replace(/\s/g, "").replace(/[-()]/g, "");
  let q = `INSERT INTO test_techs (employee_id , tech_name , tech_phone , payment_method , main_payment_address , recipient_1 , recipient_1_address ,recipient_2 , recipient_2_address,recipient_3 , recipient_3_address) VALUES ('${id}','${tech_name}' ,'${cleanedTechPhone}','${payment_address}','${payment_method}','None','None','None','None','None','None' )`;
  console.log(q);
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

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports = {
  add_tech_to_db,
};