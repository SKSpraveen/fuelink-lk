import axios from "axios";

const API = axios.create({
  baseURL: "http://172.24.89.33:5000/api/v1",
});

export default API;