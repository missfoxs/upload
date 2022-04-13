import request from "./utils";

export async function getData(data) {
  return request("/users", {
    method: "post",
    body: data,
  });
}

export async function upload(file) {
  return request("/upload", {
    method: "post",
    body: file,
  });
}
