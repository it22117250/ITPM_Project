import axios from "axios";

export const predictSales = async (sales, month) => {
  const m = Math.floor(Math.random() * 12) + 1;

  const data = await axios.post("http://127.0.0.1:5001/predict", {
    current_quantity: sales,
    month: m,
  });
  return data.data["predicted_quantity"];
};
