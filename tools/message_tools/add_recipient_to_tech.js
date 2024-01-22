const addRecipientAndAddressToTechsDB = async (
  recipient_1,
  recipient_2,
  recipient_3,
  message_recipient,
  payment_address,
  tech_phone
) => {
    let empty_recipient = "";
    let db_payment_address = ''
    if (recipient_1 === "None") {
      empty_recipient = "recipient_1";
      db_payment_address = "recipient_1_address";
    } else if (recipient_2 === "None") {
      empty_recipient = "recipient_2";
      db_payment_address = "recipient_2_address";
    } else if (recipient_3 === "None") {
      empty_recipient = "recipient_3";
      db_payment_address = "recipient_3_address";
    }
  const cleanedTechPhone = tech_phone.replace(/\s/g, "").replace(/[-()]/g, "");
  let q = `UPDATE techs SET ${empty_recipient} = '${message_recipient}' , ${db_payment_address} = '${payment_address}'  WHERE REPLACE(REPLACE(REPLACE(REPLACE(TRIM(tech_phone), ' ', ''), '-', ''), '(', ''), ')', '') = '${cleanedTechPhone}';`;
    console.log(q)
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

    return true
  } catch (error) {
    console.log(error);
    return false
  }
    
};

module.exports = {
  addRecipientAndAddressToTechsDB,
};