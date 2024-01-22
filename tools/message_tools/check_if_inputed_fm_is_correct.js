require("dotenv").config();
const check_if_inputed_fm_is_correct = async (wo_number) => {
  const res = await fetch(
    `https://api.clickup.com/api/v2/folder/90050890353/list?archived=false`,
    {
      method: "GET",
      headers: {
        Authorization: "pk_81917863_O0ND2Q40ST3A7EX27WZXYC6LQMGELKVU",
      },
    }
  );
  const response = await res.json();

  const alpha_fixers_account_managers = response.lists.map(
    (account_manager) => account_manager.id
  );
  let allTasks = [];
  for (let i = 0; i < alpha_fixers_account_managers.length; i++) {
    let lastPage = false
    let currentPage = 0
    while(!lastPage){
        const resp = await fetch(
        `https://api.clickup.com/api/v2/list/${alpha_fixers_account_managers[i]}/task?archived=false&page=${currentPage}`,
            {
                method: "GET",
                headers: {
                Authorization: "pk_81917863_O0ND2Q40ST3A7EX27WZXYC6LQMGELKVU",
                },
            }
        );
        const response = await resp.json();
        allTasks.push(...response.tasks);
        lastPage = response.last_page
        currentPage = currentPage + 1
    }
    
  }
  console.log('tasks');
  let wos = allTasks.filter((wo) => wo.name === wo_number);
  if(wos.length === 0){
    return false
  }
  let FM = wos[0].custom_fields.filter((fields) => fields.name === "FM");
  let clickupFM = FM[0].type_config.options[FM[0].value].name;
  return clickupFM
};

module.exports = {
  check_if_inputed_fm_is_correct,
};