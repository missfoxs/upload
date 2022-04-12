import qs from "qs";
const BASE_URL = "http://127.0.0.1:3001";

export default function request(
  endPoint,
  { data, token, headers, ...customerConfig }
) {
  const config = {
    method: "GET",
    headers: {
      Authorization: token ? "Bearer " + token : "",
      "Content-Type": data ? "application/json" : "",
    },
    ...customerConfig,
  };

  if (config.method.toUpperCase() === "GET") {
    endPoint += qs.stringify(data);
  } else {
    config.data = JSON.stringify(data || {});
  }

  return fetch(`${BASE_URL}${endPoint}`, config).then(async response => {
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      Promise.reject(data);
    }
  });
}
