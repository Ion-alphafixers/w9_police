const getPayments = async (wo_number , purpose,is_Bkr) => {
  console.log(wo_number)
  console.log(purpose)
  q = is_Bkr
    ? `SELECT * FROM rbk_invoices where work_order_number = '${wo_number}' AND purpose = '${purpose}'`
    : `SELECT * FROM payments where work_order_number = '${wo_number}' AND purpose = '${purpose}'`;
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

     if (data.length !== 0) {
       return true;
     }
     return false;
  } catch (error) {
    console.log(error)
  }
 
}; 

let existingPaymentTag;
let getexistingPaymentTag = async (paymentTag , wo_number , is_Bkr) => {
  wo_number = wo_number.replace(/\s/g, "");
  let fm = paymentTag.replace(wo_number + "-", "").split("-")[0];
  let purpose = paymentTag.replace(wo_number + "-", "").split("-")[1];
  existingPaymentTag = await getPayments(wo_number, purpose,is_Bkr);
  console.log(existingPaymentTag);
  return existingPaymentTag
};

module.exports = {
 getexistingPaymentTag
};