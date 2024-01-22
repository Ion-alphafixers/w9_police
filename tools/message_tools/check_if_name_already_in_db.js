const check_if_name_already_in_db = async (
  tech_name
) => {
  let q = `Select * from test_techs where tech_name = '${tech_name}'`;
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
    let data = await response.json()
    if(data.length !== 0){
        return data[0][2]
    }else{
        return false
    }
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports = {
  check_if_name_already_in_db,
};