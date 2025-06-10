export const API_URL = import.meta.env.PROD
  ? "https://final-project-claeysmaxim.onrender.com/api"
  : "http://localhost:3000/api";

export const API_TOKEN = import.meta.env.PROD
  ? "8acd766b1f509bf148c4a9cb79444915b4c5c3c4410aefd580b608f75163a59626de01be7a705fa860c0bc955536847fd6f6f2fce8a99162568f9ed8aed95a41c4f7e3cf5978cbe249813a8730f486babdaa993a4e6cf0ad5048756d7a88984d3c8e0c7019aea9ca9e63a68b9bf9109ae89f92b82204552c1eb19b47e8e6b959"
  : "4b216da7b77f8f5a44f1e1e03ce0116aee5e45a2019d8f49767c17ad862aa4b6c55e6420d74431a307a036621edb9e9ebae4e12c747ac5fc408bb4b29209c2c932b5ba1249eeb860337593d172a977b511112b807e04dde5b2ebbb426af9a4cb7f668bc01c792e507a4cf88c3f8708c60ca96824528878cb61329f3a68993b5e";

export const PAGE_SIZE_OPTIONS = [5, 10, 15, 20];