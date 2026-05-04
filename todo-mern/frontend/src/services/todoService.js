import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api/todos';

const getAll = async () => {
  const res = await axios.get(API_URL);
  return res.data.data;
};

const create = async (data) => {
  const res = await axios.post(API_URL, data);
  return res.data.data;
};

const update = async (id, data) => {
  const res = await axios.put(`${API_URL}/${id}`, data);
  return res.data.data;
};

const remove = async (id) => {
  await axios.delete(`${API_URL}/${id}`);
};

export default { getAll, create, update, remove };
