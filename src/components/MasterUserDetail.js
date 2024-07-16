import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import config from '../config'; 

const MasterUserDetail = () => {
  const { baseURL } = config;
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token'); // Retrieve the token from local storage

    const requestOptions = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
    };

    fetch(`${baseURL}/api/masteruser/${id}`, requestOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((result) => setData(result))
      .catch((error) => setError(error));
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto p-6">
        {error && <div className="text-red-500 mb-4">Error: {error.message}</div>}
        {data ? (
          <>
            <div className="mb-6 text-center mt-16">
              <h1 className="text-4xl font-bold">Master User Detail</h1>
              <p className="text-gray-400">View details for Master Code {data.code}</p>
            </div>
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <table className="min-w-full bg-gray-700 text-white rounded-lg">
                <tbody>
                  <tr>
                    <td className="px-4 py-2 font-bold">Code</td>
                    <td className="px-4 py-2">{data.code}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold">Percentage</td>
                    <td className="px-4 py-2">{data.percentage}%</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold">brokarge</td>
                    <td className="px-4 py-2">{data.brokarge}%</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold">Username</td>
                    <td className="px-4 py-2">{data.username}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold">Create Date</td>
                    <td className="px-4 py-2">{new Date(data.createDate).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold">Update Date</td>
                    <td className="px-4 py-2">{new Date(data.updateDate).toLocaleString()}</td>
                  </tr>
              
                </tbody>
              </table>
            </div>
            <MasterUserClients masterCode={data.code} />
          </>
        ) : (
          <div className="text-center text-gray-300">Loading...</div>
        )}
      </div>
    </div>
  );
};

const MasterUserClients = ({ masterCode }) => {
  const [clients, setClients] = useState([]);
  const [error, setError] = useState(null);
  const { baseURL } = config;
  useEffect(() => {
    const token = localStorage.getItem('token'); // Retrieve the token from local storage

    const requestOptions = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
    };

    fetch(`${baseURL}/api/masteruser/clients/${masterCode}`, requestOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((result) => setClients(result))
      .catch((error) => setError(error));
  }, [masterCode]);

  return (
    <div className="max-w-4xl mx-auto mt-8">
      {error && <div className="text-red-500 mb-4">Error: {error.message}</div>}
      <motion.table
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="table-auto w-full bg-gray-900 shadow-md rounded-lg overflow-hidden"
      >
        <thead className="bg-gray-800">
          <tr>
            <th className="px-4 py-2">#</th>
            <th className="px-4 py-2">Code</th>
            <th className="px-4 py-2">Budget</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Username</th>
            <th className="px-4 py-2">Create Date</th>
            <th className="px-4 py-2">Update Date</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client, index) => (
            <motion.tr
              key={client._id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="border-b border-gray-200"
            >
              <td className="px-4 py-2">{index + 1}</td>
              <td className="px-4 py-2">{client.code}</td>
              <td className="px-4 py-2">{client.budget}</td>
              <td className="px-4 py-2">{client.status}</td>
              <td className="px-4 py-2">{client.username}</td>
              <td className="px-4 py-2">{new Date(client.createDate).toLocaleString()}</td>
              <td className="px-4 py-2">{new Date(client.updateDate).toLocaleString()}</td>
            </motion.tr>
          ))}
        </tbody>
      </motion.table>
    </div>
  );
};

export default MasterUserDetail;
