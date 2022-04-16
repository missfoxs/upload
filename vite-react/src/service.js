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

export async function merge(body) {
  return request("/merge", {
    method: "post",
    body,
  });
}

export async function verify(body) {
  return request("/verify", {
    method: "post",
    body,
  });
}
