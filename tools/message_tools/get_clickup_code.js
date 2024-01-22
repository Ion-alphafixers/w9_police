const get_fm_code_map = async () => {
  const res = await fetch(
    `https://api.clickup.com/api/v2/list/901301649983/task?archived=false`,
    {
      method: "GET",
      headers: {
        Authorization: "pk_81917863_O0ND2Q40ST3A7EX27WZXYC6LQMGELKVU",
      },
    }
  );
  const response = await res.json();
  let mapper = new Map()
  response.tasks.forEach((code) => {
    let fmName = code.name;
    let fmCode = code.custom_fields.filter(
      (field) => field.id === "380e6907-2e85-407f-8473-f0b3215df9de"
    );
    mapper.set(fmName, fmCode[0].value);
  });
  console.log(mapper)
  return mapper
}

module.exports = {
  get_fm_code_map,
};