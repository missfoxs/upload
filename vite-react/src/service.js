import request from "./utils";

export async function getData(data) {
  return request("/users", {
    method: "post",
    data,
  });
}
