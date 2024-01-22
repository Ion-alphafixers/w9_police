const checkPhoneNumberAfterLike = async (tech_phone) => {
  const cleanedTechPhone = tech_phone?.replace(/\s/g, "").replace(/[-()]/g, "");
  let q = `SELECT * FROM test_techs WHERE REPLACE(REPLACE(REPLACE(REPLACE(TRIM(tech_phone), ' ', ''), '-', ''), '(', ''), ')', '') = '${
    cleanedTechPhone
  }';`;

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
      return false;
    }
    return true;
  } catch (error) {
    console.log(error);
    console.log(1);
  }
};

module.exports = {
  checkPhoneNumberAfterLike,
};
