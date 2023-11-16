const getW9 = async (tech_name) => {
  console.log(tech_name);
  let q = `SELECT * FROM payments WHERE tech_name = '${tech_name.trim()}'`
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

   let totalAmount = 0
   for(i of data){
    totalAmount = totalAmount + +i[6]
   }
   return totalAmount
  } catch (error) {
    console.log(error);
  }
}; 

const getTotalAmounts = async (tech_name, wo_number) => {
  console.log(tech_name);
  let q = `SELECT * FROM payments WHERE tech_name = '${tech_name.trim()}' and work_order_number = '${wo_number.trim()}'`;
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
    for (i of data) {
      totalAmount = totalAmount + +i[6];
    }
    return totalAmount;
  } catch (error) {
    console.log(error);
    return 0
  }
};

module.exports = {
  getTotalAmounts,
  getW9,
};

